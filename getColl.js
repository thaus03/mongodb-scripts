/* 

DESCRIÇÃO:

A função tem o objetivo listar todas as coleções de todas as databases aplicacionais, excluindo as bases "admin", "config", "local". Para facilitar no caso de termos coleções com nomes iguais, ele imprime o namespace (database+collection)

CHAMADA:

getColl()

EXEMPLO:

*******************
List of Collections
*******************
payments.test
payments.test2
onboarding.test
onboarding.test2

*/

function getColl() {
	//LISTA TODAS AS DATABASES DA INSTÂNCIA
	var datab = db.adminCommand( { listDatabases: 1, nameOnly: true, filter: { "name": { $nin: [ "admin", "config", "local"] } } } ).databases
	print("*******************")
	print("List of Collections")
	print("*******************")
	for (i=0;i < datab.length;i++){
		db.getSiblingDB(datab[i].name).getCollectionNames().forEach(function(collection) {
			print(datab[i].name+"."+collection);
		});
	}
}