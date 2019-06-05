const address = require('./address');



async function  parseTransaction(transaction, trx) {
  // console.log("transaction",transaction);
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
        (await address.findByAddress(transaction.sendingaddress)) ,
      toAddress:
        (await address.findByAddress(transaction.referenceaddress)) ,
    };
    }catch(err){ console.log("errr",err)};
  }

  module.exports = {parseTransaction}