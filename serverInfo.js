function serverInfo() {
  const serverStatus = db.serverStatus();
  const hostInfo = db.hostInfo();
  const buildInfoResult = db.runCommand({ buildInfo: 1 });
  const fcvResult = db.adminCommand({
    getParameter: 1,
    featureCompatibilityVersion: 1
  });

  const versionType = buildInfoResult.modules?.[0] ?? "community";
  const memSizeGB = Math.ceil(hostInfo.system.memSizeMB / 1024);

  // Se não for replica set, não há rs.status()
  const members = serverStatus.repl?.setName ? (rs.status().members ?? []) : [];

  // rs.status().members é a fonte completa dos membros do replica set,
  // ao contrário de serverStatus.repl.hosts/passives (dados de discovery
  // para drivers), que omitem membros hidden e não incluem árbitros
  const servers = members.map(m => ({
    name: m.name,
    stateStr: m.stateStr
  }));

  return {
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
    replicaSetName: serverStatus.repl?.setName ?? null,
    servers
  };
}


serverInfo()
