
require('dotenv').config();
const xpub="xpub661MyMwAqRbcH1ofWrryhxE8c1qdSacpCsrojJyNbzHTk2Y834a3ifXmR9XQB6UoPnhTyWVa5hxc43erWdpgAeYaN8XB668csRatUycZ2Cn";
var addressCtroller = require('../controller/address');
// var FileUtils = require('./file-utils');

var args = process.argv.slice(2);
console.log("args",args);
var path = args[0]


addressCtroller.getAndSaveAddress(xpub,path);




