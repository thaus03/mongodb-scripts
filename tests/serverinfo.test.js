// Teste da lógica de montagem do serverInfo.js: standalone vs replica set.
// Carrega o serverInfo.js REAL com db/rs stubbados (via new Function), para
// não haver drift de cópia. Rodado pelo wrapper tests/test_serverinfo.sh.
"use strict";
const fs = require("fs");
const path = require("path");

const SRC = fs.readFileSync(path.join(__dirname, "..", "serverInfo.js"), "utf8");

// Reconstrói a função serverInfo real com db/rs injetados por closure.
// O arquivo termina chamando serverInfo(); esse retorno é ignorado — devolvemos
// a referência da função para chamá-la com os stubs desejados.
function buildServerInfo(db, rs) {
  // eslint-disable-next-line no-new-func
  const factory = new Function("db", "rs", SRC + "\nreturn serverInfo;");
  return factory(db, rs);
}

let fail = 0;
function assert(desc, cond) {
  if (cond) {
    console.log("OK   | " + desc);
  } else {
    console.log("FALHA| " + desc);
    fail = 1;
  }
}

const hostInfo = {
  system: { memSizeMB: 8192, numCores: 4, currentTime: new Date("2026-01-01T00:00:00Z") },
  os: { type: "Linux", name: "RHEL", version: "8.6" }
};

function makeDb(repl) {
  return {
    serverStatus: () => ({
      host: "db01",
      version: "7.0.37",
      process: "mongod",
      uptime: 1234,
      ...(repl ? { repl } : {})
    }),
    hostInfo: () => hostInfo,
    runCommand: () => ({ modules: ["enterprise"] }),
    adminCommand: () => ({ featureCompatibilityVersion: { version: "7.0" } })
  };
}

// ---- 1) Standalone: sem repl -> omite replicaSetName e servers ----
{
  const db = makeDb(null);
  const rs = { status: () => { throw new Error("rs.status() não deve ser chamado em standalone"); } };
  const out = buildServerInfo(db, rs)();
  assert("standalone: deploymentType = standalone", out.deploymentType === "standalone");
  assert("standalone: chave replicaSetName ausente", !("replicaSetName" in out));
  assert("standalone: chave servers ausente", !("servers" in out));
  assert("standalone: campos base preservados", out.hostname === "db01" && out.mongodbVersion === "7.0.37");
}

// ---- 2) Replica set: repl presente -> inclui replicaSetName e servers ----
{
  const db = makeDb({ setName: "rs0" });
  const rs = { status: () => ({ members: [
    { name: "db01:27017", stateStr: "PRIMARY" },
    { name: "db02:27017", stateStr: "SECONDARY" }
  ] }) };
  const out = buildServerInfo(db, rs)();
  assert("replicaSet: deploymentType = replicaSet", out.deploymentType === "replicaSet");
  assert("replicaSet: replicaSetName = rs0", out.replicaSetName === "rs0");
  assert("replicaSet: 2 membros mapeados", Array.isArray(out.servers) && out.servers.length === 2);
  assert("replicaSet: membro com name e stateStr",
    out.servers[0].name === "db01:27017" && out.servers[0].stateStr === "PRIMARY");
}

console.log("---");
console.log(fail === 0 ? "Todos os testes passaram." : "Há falhas.");
process.exit(fail);
