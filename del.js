function del(d1,d2) {
 
 var cursor = db.getSiblingDB("teste").deliveryOrder.find({$and:[ {"_id" :{$gte: ObjectId.fromDate(new Date(d1))}}, {"_id":{$lte: ObjectId.fromDate(new Date(d2))}}]})
 var tot = cursor.count()

cursor.forEach(function(d){db.getSiblingDB("teste").deliveryOrder.remove({_id: d._id})+print("Removidos os ids "+d._id)})
print("Total: "+tot)

}