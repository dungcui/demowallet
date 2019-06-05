const db = require('../db');

const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const BlockModel = require('../models/block');



async function Save(height) {
    var Block = new BlockModel({height});
    await Block.save(function (err) {
            if(err) {
                // console.log(err);
            console.log("Unable to save address to database") ;
        } else {
            console.log("save address susscess!" ,address, "with path",path);
        }
    
    });
  
};

async function Update(height) {
    var Block = new BlockModel({height});
    await Block.updateOne({ height: height },function (err) {
            if(err) {
                // console.log(err);
            console.log("update fail") ;
        } else {
            console.log("updated block !" ,height);
        }
    
    });
  
};

async function getLastedBlock() {
    // const xpub = new HDPublicKey(wallet.xpubs);
    const block = await BlockModel.findOne({});
    return block;
}

module.exports = { Update, Save ,getLastedBlock};
