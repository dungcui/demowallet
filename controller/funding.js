const db = require('../db');

const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const FundingModel = require('../models/funding');



async function Save(transactionHash,outputIndex,blockHeight,amount,addressId) {
    var Fund = new FundingModel({transactionHash,outputIndex,blockHeight,amount,addressId});
    await Fund.save(function (err) {
            if(err) {
                // console.log(err);
            console.log("Unable to save funding to database",err) ;
        } else {
            console.log("save funding susscess! block" ,blockHeight, "txHash",transactionHash, "output index :",outputIndex, "amount :",amount);
        }
    
    });
  
};


async function findFundingByTxHashAndOutputIndex(transactionHash,outputIndex) {
    // const xpub = new HDPublicKey(wallet.xpubs);
   const fund= (await FundingModel.findOne({ transactionHash, outputIndex}))|| null;
   return fund;
}


async function getAllFundings() {
    // const xpub = new HDPublicKey(wallet.xpubs);
    FundingModel.find({}).exec( function (err, fundings ) {
        if(err) {
            console.log("Dont have any funding") ;
            process.exit();

        }else {
            console.log(fundings) ;
            process.exit();

        }
        
    });
}

module.exports = { findFundingByTxHashAndOutputIndex, Save,getAllFundings };
