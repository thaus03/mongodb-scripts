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

  // Mantém a "fonte" original dos hosts listados (hosts + passives)
  const replHosts = serverStatus.repl?.hosts ?? [];
  const replPassives = serverStatus.repl?.passives ?? [];
  const replServers = replHosts.concat(replPassives);

  // Se não for replica set, não há rs.status()
  const members = serverStatus.repl?.setName ? (rs.status().members ?? []) : [];

  // Mapa rápido name -> stateStr
  const stateByName = new Map(members.map(m => [m.name, m.stateStr]));

  // Retorna exatamente o mesmo conjunto de "servers" (hosts+passives),
  // mas enriquecido com stateStr quando existir
  const servers = replServers.map(name => ({
    name,
    stateStr: stateByName.get(name) ?? null
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
