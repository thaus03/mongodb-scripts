# mongodb-scripts

Coleção de scripts para operação e manutenção de instâncias MongoDB.

## Testes

Testes de lógica pura (executáveis fora de um servidor real) ficam em `tests/`. Para rodar a suíte:

```bash
for t in tests/*.sh; do bash "$t"; done
```

Os testes de scripts `mongosh` (JS) usam Node; onde o Node não está disponível, o teste é pulado com aviso em vez de falhar.

## Scripts

### `update_mongo.sh` (v3.1.0)

Automatiza a atualização do MongoDB (edição Enterprise) em servidores RHEL 7 e 8.

- Detecta automaticamente a versão major do RHEL do servidor (via `/etc/os-release`, com fallback para `/etc/redhat-release`) e baixa o binário correspondente (`MongoDB_<versão>_E_RHEL<major>.zip`). Isso permite rodar o mesmo script em clusters mistos (RHEL 7 e 8). A detecção pode ser sobrescrita com `export RHEL_MAJOR=7` (ou `8`) antes da execução.
- Baixa o pacote da versão alvo a partir do repositório interno.
- Usa o usuário e o diretório home da sessão atual (`id`, `$HOME`) como base de execução, sem dados fixos de cliente.
- Para, atualiza e reinicia o serviço `mongod` via `yum localinstall`.
- Remove o `mongodb-org-shell` e faz limpeza de cache (`yum`, além do `dnf` quando disponível) e logs antigos.
- Valida a versão instalada ao final; se corresponder à versão alvo, registra a atualização em `.update_info` e remove o próprio script.
- Interrompe a execução no primeiro comando que falhar, com log detalhado em `$HOME/.update_mongo.log`.
- Versionamento do script segue [SemVer](https://semver.org/).

**Uso:**
```bash
./update_mongo.sh
```

### `serverInfo.js` (v1.1.0)

Script para o `mongosh` que coleta um resumo do estado do servidor MongoDB. Costuma ser executado após o `update_mongo.sh` para validar que a instância subiu corretamente.

- Reúne informações de `serverStatus`, `hostInfo`, `buildInfo` e `featureCompatibilityVersion`.
- Identifica a edição (Community/Enterprise), versão, uptime e horário local do host.
- Detalha recursos do host (núcleos de CPU, memória em GB, sistema operacional).
- Informa o tipo de implantação em `deploymentType` (`standalone` ou `replicaSet`).
- Em replica set, lista todos os membros em `servers` (via `rs.status()`, incluindo hidden e árbitros) com seu `stateStr` atual, além do `replicaSetName`. Em **standalone** esses dois campos são **omitidos**, pois não se aplicam.

**Uso:**
```bash
mongosh --file serverInfo.js
```

### `resume.js` (v1.0.1)

Função para o `mongosh` que retorna um resumo enxuto do replica set.

- Define a função `resume()`, que devolve o nome do replica set e a lista de membros.
- Para cada membro traz `_id`, host, `stateStr` atual e a prioridade configurada.
- Casa os dados de `rs.status()` e `rs.conf()` por `_id` (não por índice do array), já que as duas chamadas não garantem a mesma ordem dos membros.

**Uso:**
```bash
mongosh --eval 'load("resume.js"); printjson(resume())'
```
