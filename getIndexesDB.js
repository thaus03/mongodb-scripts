/* 

DESCRIÇÃO:

A função tem o objetivo listar todos os indices de uma ou mais databases, nesse caso, ele faz a pesquisa por todas que contém a palavra "payments" no nome da database.

CHAMADA:

getIndexesDB()

EXEMPLO:

Indexes for payments.test:
[
        {
                "v" : 2,
                "key" : {
                        "_id" : 1
                },
                "name" : "_id_",
                "ns" : "payments.test"
        }
]
Indexes for payments.test2:
[
        {
                "v" : 2,
                "key" : {
                        "_id" : 1
                },
                "name" : "_id_",
                "ns" : "payments.test2"
        },
		{
                "v" : 2,
                "unique" : true,
                "key" : {
                        "payment_id" : 1
                },
                "name" : "payment_id_1",
                "background" : true,
                "ns" : "payments.test2"
        }

]


*/

function getIndexesDB () {
	//LISTA TODAS AS DATABASES QUE CONTÉM "PAYMENTS" NO NOME
	var datab = db.adminCommand( { listDatabases: 1, nameOnly: true, filter: { "name": { $in: [ /payments/] } } } ).databases
	for (i=0;i < datab.length;i++){
	db.getSiblingDB(datab[i].name).getCollectionNames().forEach(function(collection) {
   indexes = db.getSiblingDB(datab[i].name)[collection].getIndexes();
   print("Indexes for " + datab[i].name+"."+collection + ":");
   printjson(indexes);
});
	}
}