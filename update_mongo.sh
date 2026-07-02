#!/bin/bash

# =========================
# update_mongo_v3.sh
# =========================

set -o pipefail

# Nome do arquivo de log
LOGFILE="/home/adm.ic48780/.update_mongo.log"

# Variáveis do pacote alvo
TARGET_VERSION="7.0.37"
ZIP_FILE="MongoDB_7.0.37_E_RHEL8.zip"
UNZIP_DIR="MongoDB_7.0.37_E_RHEL8"
BASE_DIR="/home/adm.ic48780"

# Caminho absoluto do script (para auto-delete no final, se ok)
SCRIPT_PATH="$(readlink -f "$0" 2>/dev/null || echo "$0")"

# Função para executar comandos com log e parar em erro (inclusive em pipelines com tee)
run_cmd() {
    echo -e "\n>> Executando: $1" | tee -a "$LOGFILE"

    eval "$1" 2>&1 | tee -a "$LOGFILE"
    rc=${PIPESTATUS[0]}

    if [[ $rc -ne 0 ]]; then
        echo "ERRO: comando falhou (exit=$rc). Abortando execução." | tee -a "$LOGFILE"
        exit "$rc"
    fi
}

echo "===== Início da execução: $(date) =====" | tee -a "$LOGFILE"

# (2) Descobre UID/GID reais do usuário antes do chown
ADM_UID="$(id -u adm.ic48780 2>/dev/null)"
ADM_GID="$(id -g adm.ic48780 2>/dev/null)"

if [[ -z "$ADM_UID" || -z "$ADM_GID" ]]; then
    echo "ERRO: não foi possível obter UID/GID do usuário adm.ic48780 (usuário existe?). Abortando." | tee -a "$LOGFILE"
    exit 1
fi

run_cmd "mkdir -p $BASE_DIR"
run_cmd "chown ${ADM_UID}:${ADM_GID} $BASE_DIR -R"
run_cmd "cd $BASE_DIR"

# Se o wget falhar (ex.: 404), o script para aqui
run_cmd "wget https://repository.getnet.com.br/binarios/mongodb/enterprise/$ZIP_FILE"

# Para evitar abortar por causa do 'systemctl status' com serviço parado, deixamos status não-fatal aqui
run_cmd "systemctl stop mongod"
run_cmd "systemctl disable mongod"
run_cmd "systemctl status mongod || true"

run_cmd "cd $BASE_DIR/"
run_cmd "unzip -o $ZIP_FILE"
run_cmd "yum --disablerepo="*" localinstall ${UNZIP_DIR}/* -y"

run_cmd "systemctl start mongod"
run_cmd "systemctl enable mongod"
run_cmd "systemctl status mongod"

# Pode não existir em alguns cenários; não falhar a execução por isso
run_cmd "yum remove mongodb-org-shell* -y || true"

# Housekeeping
run_cmd "dnf clean all"
run_cmd "yum clean all"
run_cmd "cat /dev/null > /var/log/mongodb/mongod.log"
run_cmd "rm -f /var/log/mongodb/mongod.log.* /etc/mongod.conf.rpmnew"
run_cmd "rm -rf $BASE_DIR/MongoDB_*"

# (1) Valida versão instalada e, se OK, remove o próprio script no final
INSTALLED_VERSION="$(mongod --version 2>/dev/null | head -n 1 | grep -Eo '[0-9]+\.[0-9]+\.[0-9]+' | head -n 1)"

if [[ "$INSTALLED_VERSION" == "$TARGET_VERSION" ]]; then
    echo "OK: MongoDB instalado com êxito. Versão detectada: $INSTALLED_VERSION" | tee -a "$LOGFILE"
    DELETE_SELF="yes"
else
    echo "ATENÇÃO: versão detectada: '${INSTALLED_VERSION:-N/A}', esperada: '$TARGET_VERSION'. Script NÃO será removido." | tee -a "$LOGFILE"
    DELETE_SELF="no"
fi

# Assinatura final
run_cmd "echo \"Atualizado para a versão \$(mongod --version | head -1) por Igor Carvalho em \$(date).\" >> $BASE_DIR/.update_info"
run_cmd "chown ${ADM_UID}:${ADM_GID} $BASE_DIR/.update_info"

echo "===== Fim da execução: $(date) =====" | tee -a "$LOGFILE"

# Auto-delete do script (somente se a validação da versão passou)
if [[ "$DELETE_SELF" == "yes" ]]; then
    # Não queremos falhar o script caso não tenha permissão para remover o arquivo
    run_cmd "rm -f -- '$SCRIPT_PATH' || true"
fi
