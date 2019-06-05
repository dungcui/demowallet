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
        // var Block = new BlockModel({height});
        const res=await BlockModel.findOne({}).updateOne({ height: height });
            if(res.n==0) {
                console.log("update fail") ;
            } else if(res.n==1)  {
                console.log("updated block !" ,height);
            }
      
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
