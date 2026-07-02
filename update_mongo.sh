#!/bin/bash

# Nome do arquivo de log
LOGFILE="/home/adm.ic48780/.update_mongo.log"

# Função para executar comandos com log e exibição na tela
run_cmd() {
    echo -e "\n>> Executando: $1" | tee -a "$LOGFILE"
    eval "$1" 2>&1 | tee -a "$LOGFILE"
}

echo "===== Início da execução: $(date) =====" | tee -a "$LOGFILE"

run_cmd "mkdir -p /home/adm.ic48780"
run_cmd "chown 1237267420:1237200513 /home/adm.ic48780 -R"
run_cmd "cd /home/adm.ic48780"
run_cmd "wget https://repository.getnet.com.br/binarios/mongodb/community/MongoDB_7.0.21_C_RHEL8.zip"
run_cmd "systemctl stop mongod; systemctl disable mongod; systemctl status mongod"
run_cmd "cd /home/adm.ic48780/"
run_cmd "unzip -o MongoDB_7.0.21_C_RHEL8.zip"
run_cmd "yum localinstall MongoDB_7.0.21_C_RHEL8/* -y"
run_cmd "systemctl start mongod; systemctl enable mongod; systemctl status mongod"
run_cmd "yum remove mongodb-org-shell* -y"
# Housekeeping
run_cmd "dnf clean all"
run_cmd "yum clean all"
run_cmd "> /var/log/mongodb/mongod.log"
run_cmd "rm -f /var/log/mongodb/mongod.log.* /etc/mongod.conf.rpmnew"
run_cmd "rm -rf /home/adm.ic48780/MongoDB_*"

# Assinatura final
run_cmd "echo \"Atualizado para a versão \$(mongod --version | head -1) por Igor Carvalho em \$(date).\" >> /home/adm.ic48780/.update_info"
run_cmd "chown 1237267420:1237200513 /home/adm.ic48780/.update_info"

echo "===== Fim da execução: $(date) =====" | tee -a "$LOGFILE"
