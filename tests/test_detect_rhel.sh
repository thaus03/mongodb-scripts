#!/bin/bash
# =========================================================================
# test_detect_rhel.sh
# Smoke test da detecção de versão do RHEL usada pelo update_mongo.sh.
#
# Duas frentes:
#   1) Testa a LÓGICA de detecção de forma isolada (réplica da função do
#      script, alimentada com /etc/os-release e /etc/redhat-release falsos).
#   2) Testa o SCRIPT REAL para travar regressões: valida a sintaxe e garante
#      que o nome do binário continua sendo montado dinamicamente a partir do
#      RHEL detectado (ninguém voltou a fixar "RHEL8" no ZIP_FILE).
#
# Rodar: bash tests/test_detect_rhel.sh   (a partir da raiz do repositório)
# =========================================================================
set -o pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET_SCRIPT="$SCRIPT_DIR/update_mongo.sh"

# Réplica da função detect_rhel_major do update_mongo.sh, parametrizada para
# apontar a arquivos de teste. Deve espelhar a lógica do script.
detect_rhel_major() {
    local osrel="$1" rhrel="$2" ver=""
    if [[ -r "$osrel" ]]; then
        ver="$(. "$osrel" 2>/dev/null; echo "${VERSION_ID%%.*}")"
    fi
    if [[ -z "$ver" && -r "$rhrel" ]]; then
        ver="$(grep -oE 'release [0-9]+' "$rhrel" | grep -oE '[0-9]+')"
    fi
    echo "$ver"
}

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
fail=0

check() {
    local desc="$1" expected="$2" got="$3"
    if [[ "$got" == "$expected" ]]; then
        echo "OK   | $desc -> '$got'"
    else
        echo "FALHA| $desc -> esperado '$expected', obtido '$got'"
        fail=1
    fi
}

assert() {
    local desc="$1" cond="$2"
    if [[ "$cond" == "0" ]]; then
        echo "OK   | $desc"
    else
        echo "FALHA| $desc"
        fail=1
    fi
}

# ---- 1) Lógica de detecção (isolada) ------------------------------------
printf 'VERSION_ID="8.6"\n' > "$TMP/os1"
check "os-release RHEL8" "8" "$(detect_rhel_major "$TMP/os1" "$TMP/nao_existe")"

printf 'VERSION_ID="7.9"\n' > "$TMP/os2"
check "os-release RHEL7" "7" "$(detect_rhel_major "$TMP/os2" "$TMP/nao_existe")"

printf 'Red Hat Enterprise Linux Server release 7.9 (Maipo)\n' > "$TMP/rh3"
check "fallback redhat-release RHEL7" "7" "$(detect_rhel_major "$TMP/nao_existe" "$TMP/rh3")"

printf 'VERSION_ID="9.3"\n' > "$TMP/os4"
check "os-release RHEL9 (major genérico)" "9" "$(detect_rhel_major "$TMP/os4" "$TMP/nao_existe")"

check "sem fontes -> vazio (script aborta)" "" "$(detect_rhel_major "$TMP/nao_existe" "$TMP/tambem_nao")"

RHEL_MAJOR="$(detect_rhel_major "$TMP/os1" "$TMP/nao_existe")"
TARGET_VERSION="7.0.37"
check "nome do ZIP montado" "MongoDB_7.0.37_E_RHEL8.zip" "MongoDB_${TARGET_VERSION}_E_RHEL${RHEL_MAJOR}.zip"

# ---- 2) Regressão contra o script real ----------------------------------
bash -n "$TARGET_SCRIPT" >/dev/null 2>&1
assert "update_mongo.sh passa no bash -n" "$?"

grep -q 'ZIP_FILE="MongoDB_${TARGET_VERSION}_E_RHEL${RHEL_MAJOR}' "$TARGET_SCRIPT"
assert "ZIP_FILE montado dinamicamente (sem RHEL fixo)" "$?"

grep -q 'detect_rhel_major' "$TARGET_SCRIPT"
assert "função detect_rhel_major presente no script" "$?"

echo "---"
if [[ $fail -eq 0 ]]; then
    echo "Todos os testes passaram."
else
    echo "Há falhas."
fi
exit $fail
