const addressCtroller = require('./address');

async function  parseTransaction(transaction) {
  console.log("addressassssssss", (await addressCtroller.findByAddress(transaction.sendingaddress)));
  try {
    return {
      transactionHash: transaction.txid,
      from: transaction.sendingaddress,
      to: transaction.referenceaddress,
      propertyId: transaction.propertyid,
      blockHash: transaction.blockhash,
      blockHeight: transaction.block,
      outputIndex: transaction.positioninblock,
      amount: Number(transaction.amount),
      currency: "USDT",
      feeCurrency: "BTC",
      feeAmount: Number(transaction.fee),
      valid: transaction.valid,
      fromAddress:
        (await addressCtroller.findByAddress(transaction.sendingaddress)) || null,
      toAddress:
        (await addressCtroller.findByAddress(transaction.referenceaddress)) ||null,
    };
    }catch(err){ console.log("errr",err)};
  }

  module.exports = {parseTransaction}