const db = require('../db');

const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const AddressModel = require('../models/address');
const { Address, HDPublicKey, Networks } = require('bitcore-lib');

async function getAndSaveAddress(xpub,path)
{
    const addressHash=await derive(xpub, path);
    await Save(addressHash.address,path,"userAddress");
    return;
}

async function Save(address,path,type) {
    var Address = new AddressModel({address,path,type});
    await Address.save(function (err) {
            if(err) {
                // console.log(err);
            console.log("Unable to save address to database") ;
            process.exit();
        } else {
            console.log("save address susscess!" ,address, "with path",path);
            process.exit();
        }
    
    });
  
};
async function derive(xpub,path) {
// const xpub = new HDPublicKey(wallet.xpubs);
const xpubs = new HDPublicKey(xpub);
const address = new Address(xpubs.derive(`m/${path}`).publicKey, Networks.mainnet).toString();
return { address };
}

async function findByAddress(address) {
    // const xpub = new HDPublicKey(wallet.xpubs);
   const addresses= (await AddressModel.findOne({ address:address }))||null;
   return addresses;
}
async function getAllAddress() {
    // const xpub = new HDPublicKey(wallet.xpubs);
    AddressModel.find({}).select('address , path').exec( function (err, addresses) {
        if(err) {
            console.log("Dont have any address") ;
            process.exit();

        }else {
            console.log(addresses) ;
            process.exit();

        }
        
    });
}
module.exports = { getAndSaveAddress ,findByAddress,getAllAddress};
