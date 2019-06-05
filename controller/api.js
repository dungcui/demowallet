const jayson = require('jayson');
const Promise = require('bluebird');



  client = Promise.promisifyAll(jayson.client.http("http://admin:secret@95.216.227.168:8332"));
  
  async function getTxsByHeight(height) {
    return (await client.requestAsync('omni_listblocktransactions', [height])).result;
  }

  async function getRawTx(txHash) {
    return (await client.requestAsync('omni_gettransaction', [txHash])).result;
  }


  async function getLatestBlockHeight() {
    return (await client.requestAsync('omni_getinfo', [])).result.block;
  }

  module.exports = {getLatestBlockHeight,getRawTx,getTxsByHeight};

