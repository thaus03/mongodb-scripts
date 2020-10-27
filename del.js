/* 

DESCRIÇÃO:

A função tem o objetivo de remover documentos de coleções com base num período estipulado pela equipe. Por exemplo, é possível remover documentos criados entre Janeiro de 2020 e Julho de 2020.

EXEMPLO:

del("2020-01-01","2020-07-31")

*/

function del(d1,d2) {
 
 var cursor = db.getSiblingDB("teste").deliveryOrder.find({$and:[ {"_id" :{$gte: ObjectId.fromDate(new Date(d1))}}, {"_id":{$lte: ObjectId.fromDate(new Date(d2))}}]})
 var tot = cursor.count()

cursor.forEach(function(d){db.getSiblingDB("teste").deliveryOrder.remove({_id: d._id})+print("Removidos os ids "+d._id)})
print("Total: "+tot)

}