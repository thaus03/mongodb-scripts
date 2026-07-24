#!/bin/bash
# Wrapper para a suíte de testes do serverInfo.js (lógica standalone vs replica
# set). O teste em si é Node (tests/serverinfo.test.js), pois o script é JS de
# mongosh. A CI (ubuntu-latest) tem Node; em ambientes sem Node o teste é
# pulado com aviso, em vez de falhar.
set -o pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if ! command -v node >/dev/null 2>&1; then
    echo "SKIP | Node não disponível — teste do serverInfo.js não executado neste ambiente."
    exit 0
fi

node "$DIR/serverinfo.test.js"
