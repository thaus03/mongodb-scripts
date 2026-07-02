// resume.js
// Versão: 1.0.0

function resume() {
    // Cache dos comandos MongoDB para evitar múltiplas execuções
    const replicaStatus = rs.status();
    const replicaConfig = rs.conf();
    const replicaSetName = replicaStatus.set;
    const members = replicaStatus.members;
    const configMembers = replicaConfig.members;

    const memberDetails = members.map((member, index) => ({
        _id: member._id,
        host: member.name,
        status: member.stateStr,
        priority: configMembers[index]?.priority ?? 0
    }));
    return {
        replicaSet: replicaSetName,
        members: memberDetails
    };
}
