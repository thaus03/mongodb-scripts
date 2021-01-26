##
# FAZ O BACKUP DE N DATABASES LISTADAS
##

#!/bin/bash
db_list_="<db1> <db2>"
host=127.0.0.1
port=27017
authDB=admin
out_dir=/data/mongodump_date +%y%m%d
user=xx
pass=xx


for db in ${db_list[@]}; do
  	mongodump --host $host --port $port --authenticationDatabase $authDB -u $user -p $pass -d $db --gzip --out $out_dir
done
