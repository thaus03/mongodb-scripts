// resume.js
// Versão: 1.0.1

function resume() {
    // Cache dos comandos MongoDB para evitar múltiplas execuções
    const replicaStatus = rs.status();
    const replicaConfig = rs.conf();
    const replicaSetName = replicaStatus.set;
    const members = replicaStatus.members;
    const configMembers = replicaConfig.members;

    // Casa por _id em vez de índice, pois rs.status() e rs.conf() não garantem a mesma ordem
    const configByMemberId = new Map(configMembers.map(m => [m._id, m]));

    const memberDetails = members.map(member => ({
        _id: member._id,
        host: member.name,
        status: member.stateStr,
        priority: configByMemberId.get(member._id)?.priority ?? 0
    }));
    return {
        replicaSet: replicaSetName,
        members: memberDetails
    };
}
