function serverInfo() {
  // Versão: 1.1.0
  const serverStatus = db.serverStatus();
  const hostInfo = db.hostInfo();
  const buildInfoResult = db.runCommand({ buildInfo: 1 });
  const fcvResult = db.adminCommand({
    getParameter: 1,
    featureCompatibilityVersion: 1
  });

  const versionType = buildInfoResult.modules?.[0] ?? "community";
  const memSizeGB = Math.ceil(hostInfo.system.memSizeMB / 1024);

  // Standalone não participa de replica set: serverStatus.repl é ausente.
  // Nesse caso não há rs.status(), replicaSetName nem lista de membros.
  const replicaSetName = serverStatus.repl?.setName ?? null;
  const isReplicaSet = Boolean(replicaSetName);

  const info = {
    hostname: serverStatus.host,
    mongodbVersion: serverStatus.version,
    versionType,
    featureCompatibilityVersion: fcvResult.featureCompatibilityVersion,
    process: serverStatus.process,
    uptime: serverStatus.uptime,
    localTime: hostInfo.system.currentTime,
    os: {numCores: hostInfo.system.numCores,
    memSizeGB,
    ...hostInfo.os},
    deploymentType: isReplicaSet ? "replicaSet" : "standalone"
  };

  // replicaSetName e servers só fazem sentido em cluster; em standalone as
  // chaves são omitidas (não incluídas como null/[]).
  if (isReplicaSet) {
    // rs.status().members é a fonte completa dos membros do replica set,
    // ao contrário de serverStatus.repl.hosts/passives (dados de discovery
    // para drivers), que omitem membros hidden e não incluem árbitros.
    const members = rs.status().members ?? [];
    info.replicaSetName = replicaSetName;
    info.servers = members.map(m => ({
      name: m.name,
      stateStr: m.stateStr
    }));
  }

  return info;
}


serverInfo()
