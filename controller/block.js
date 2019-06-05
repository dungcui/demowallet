const db = require('../db');

const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const BlockModel = require('../models/block');





async function find() {
    // const xpub = new HDPublicKey(wallet.xpubs);
    const block = await BlockModel.findOne({});
    return block;

}

async function Update(height) {
    const found = await find();
    if(found)
    {
        var Block = new BlockModel({height});
        const res=await Block.updateOne({ height: height , updatedAt :new Date().toISOString()});
            //     if(res) {
            //         // console.log(err);
            //     console.log("update fail") ;
            // } else {
            //     console.log("updated block !" ,height);
            // }
        
        // });
        console.log("res",res);
    }else 
    {
        var Block = new BlockModel({height});
        await Block.save(function (err) {
            if(err) {
            console.log("Unable to save block to database") ;
        } else {
            console.log("saved block !" ,height);
        }
    
    });
    }
  
};

async function getLastedBlock() {
    // const xpub = new HDPublicKey(wallet.xpubs);
    const block = await BlockModel.findOne({});
    return block;
}

module.exports = { Update ,getLastedBlock};
