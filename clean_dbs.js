/*
{
    Desc: "Faz a limpeza de várias databases no MongoDB"
    __v: 001
}
*/

var databases = ["db1", "db2", "db3"]
for (i in databases) {
    print("*************************************")
    print("Database: "+databases[i])
    print("*************************************")
    print("Removendo roles")
    db.getSiblingDB(databases[i]).runCommand({ dropAllRolesFromDatabase: 1, writeConcern: { w: "majority" } })
    print("Removendo usuários")
    db.getSiblingDB(databases[i]).runCommand({ dropAllUsersFromDatabase: 1, writeConcern: { w: "majority" } })
    print("Removendo índices e coleções")
    db.getSiblingDB(databases[i]).runCommand({ dropDatabase: 1, writeConcern: { w: "majority" } })
}
print("Removido um total de "+databases.length+" databases")
