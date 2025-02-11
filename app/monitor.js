const Promise = require('bluebird');
const startBlockHeight=579367;
var blockCtroller = require('../controller/block');
var fundingsCtroller = require('../controller/funding');
// let isRunning = false;
var api = require('../controller/api');
var utils = require('../controller/utils');
const TinyQueue = require('tinyqueue');

let nextBlocks = new TinyQueue([], (a, b) => a.height - b.height);


  function validateBlock(block, fromHeight, toHeight) {
    return block && (block.height >= fromHeight && block.height <= toHeight);
  }

  async function monitorNetwork() {

    // const latestProcessedBlock = await blockCtroller.getLastedBlock();

    // const currentHeight = latestProcessedBlock
    //   ? latestProcessedBlock.height
    //   : startBlockHeight - 1;

    const currentHeight=579367;

    const latestHeight = await api.getLatestBlockHeight();
    console.log("latestHeight",latestHeight);
    const confirmedHeight = latestHeight - 2;
    console.log("currentHeight",currentHeight);

    if (currentHeight < confirmedHeight) {
      // Fetch and process at the same time
      await Promise.all([
        fetchRange(currentHeight + 1, confirmedHeight),
        processRange(currentHeight + 1, confirmedHeight),
      ]);
    } else {
      // Reach confirmed height, nothing to do
      await Promise.delay(1000 * 10);
     
    }
  }

  async function fetchRange(fromHeight, toHeight) {
    if (fromHeight > toHeight) return;
    const heights = rangeToArray(fromHeight, toHeight);
    await Promise.each(
      heights,
      async (height) => {
        // if (!isRunning) return;
        const txs = await api.getTxsByHeight(height);
        const transactions = [];

        await Promise.each(txs, async (tx) => {
          let transactionRaw = null;
          try {
            transactionRaw = await api.getRawTx(tx);
            const parsedTx = await utils.parseTransaction(transactionRaw);
            if (parsedTx.valid)   transactions.push(parsedTx);
          
          } catch (error) {
            // ư\debug("error ",error);
            transactionRaw = null;
          }
        }).catch(err => console.log(err));
        // console.log("transactions",transactions);
        if (transactions.length > 0) {
          const nextBlock = { hash: transactions[0].blockHash, height, transactions };
          nextBlocks.push(nextBlock);
        }
      },
      { concurrency: 5 },
    );
  }
        
    
    
  

  function rangeToArray(startAt, to) {
    const size = (to - startAt) + 1; // include startAt and to
    return [...Array(size).keys()].map(i => i + startAt);
  }

  async function shouldProcessNextBlock(fromHeight, toHeight) {
    // Pre-validate
    if ( fromHeight > toHeight) return false;

    // Validate next block
    const nextBlock = nextBlocks.peek();
    if (validateBlock(nextBlock, fromHeight, toHeight)) return true;
    await Promise.delay(1000 * 10);
    return shouldProcessNextBlock(fromHeight, toHeight);
  }

async function processRange(fromHeight, toHeight) {
    if (await shouldProcessNextBlock(fromHeight, toHeight)) {
      const nextBlock = nextBlocks.pop();
    //   console.log("nextBlock",nextBlock);
      await processBlock(nextBlock);
      await processRange(nextBlock.height + 1, toHeight);
    }
  }


  async function processBlock({ height, transactions }) {
      //isRunning = true;
      console.log(`Process block ${height}`);
      const fundings = await buildFundings(transactions);
      console.log(fundings);
      await Promise.each(fundings, tx => fundingsCtroller.Save(tx.transactionHash,tx.outputIndex,tx.blockHeight,tx.amount,tx.toAddress._id));
      await blockCtroller.Update( height);

  }

  async function buildFundings(transactions) {
    // Our filters
    const isFunding = transaction => transaction.toAddress;
    const isNotExisted = async (tx) => {
      const { transactionHash, outputIndex } = tx;
      return !(await fundingsCtroller.findFundingByTxHashAndOutputIndex(
        transactionHash,
        outputIndex
      ));
    };
  
    const addFundingAttributes = tx => ({
      ...tx,
      addressId: tx.toAddress.id
    });
    const fundingTransaction = await Promise.filter(
      transactions,
      async (tx) => {
        const notExisted = await isNotExisted(tx);
        // console.log("isFunding(tx) ",isFunding(tx) );
        // console.log("isSupportedCurrency(tx) ",isSupportedCurrency(tx) );;
        // console.log("notExisted" ,notExisted);
        return isFunding(tx)  && notExisted;
      },
      { concurrency: 1 },
    );

    return fundingTransaction.map(addFundingAttributes);
  }
  const registerSignals = () => {
    process.on('SIGTERM', () => shutdown());
    process.on('SIGINT', () => shutdown());
  };

  async function run() {
    while (true) {
      await monitorNetwork();
    }
  }

  
  run()
    .then(registerSignals)
    .catch((err) => {
      console.log(err);
      process.exit(1);
    });

    async function shutdown() {

          process.exit(0);
    }
  


