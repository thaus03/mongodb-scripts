# mongodb-scripts

Coleção de scripts para operação e manutenção de instâncias MongoDB.

## Scripts

### `update_mongo.sh` (v3.0.0)

Automatiza a atualização do MongoDB (edição Enterprise) em servidores RHEL 8.

- Baixa o pacote da versão alvo a partir do repositório interno.
- Usa o usuário e o diretório home da sessão atual (`id`, `$HOME`) como base de execução, sem dados fixos de cliente.
- Para, atualiza e reinicia o serviço `mongod` via `yum localinstall`.
- Remove o `mongodb-org-shell` e faz limpeza de cache (`yum`/`dnf`) e logs antigos.
- Valida a versão instalada ao final; se corresponder à versão alvo, registra a atualização em `.update_info` e remove o próprio script.
- Interrompe a execução no primeiro comando que falhar, com log detalhado em `$HOME/.update_mongo.log`.
- Versionamento do script segue [SemVer](https://semver.org/).

**Uso:**
```bash
./update_mongo.sh
```

### `serverInfo.js` (v1.0.1)

Script para o `mongosh` que coleta um resumo do estado do servidor MongoDB.

- Reúne informações de `serverStatus`, `hostInfo`, `buildInfo` e `featureCompatibilityVersion`.
- Identifica a edição (Community/Enterprise), versão, uptime e horário local do host.
- Detalha recursos do host (núcleos de CPU, memória em GB, sistema operacional).
- Caso o servidor faça parte de um replica set, lista todos os membros (via `rs.status()`, incluindo hidden e árbitros) com seu `stateStr` atual.

**Uso:**
```bash
mongosh --file serverInfo.js
```
