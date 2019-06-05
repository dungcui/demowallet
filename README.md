# wallet

# install nodejs and docker :

# install dependencies : npm install

#migration db mongodb:

docker pull mongo:4.0.4
docker run -d -p 27017-27019:27017-27019 --name wallet mongo:4.0.4

# get new address by path :

node app/genAddress.js '0/1/0'

# get all address  :



node app/getAllAddress.js

# start monitor

node app/monitor.js 

# get all deposit 

node app/getAllFundings.js




