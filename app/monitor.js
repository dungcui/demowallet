const Promise = require('bluebird');
const startBlockHeight=579285;
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
    // Get height from database
    const latestProcessedBlock = await blockCtroller.getLastedBlock();
    
    // We set current height to height from db
    // Or from environment if db is blank
    const currentHeight = latestProcessedBlock
      ? latestProcessedBlock.height
      : startBlockHeight - 1;
    
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
      await Promise.delay(1000 * sleepTime);
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
            const parsedTx = await utils.parseTransaction(transactionRaw, tx);
            console.log("parsedTx",parsedTx);
            if (parsedTx.valid)
                {
                    console.log("dkmmm");
                    transactions.push(parsedTx);
                } 
          } catch (error) {
            // ư\debug("error ",error);
            transactionRaw = null;
          }
        });
        console.log("transactions",transactions);
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
      console.log("nextBlock",nextBlock);
      await processBlock(nextBlock);
      await processRange(nextBlock.height + 1, toHeight);
    }
  }


  async function processBlock({ height, transactions }) {
      //isRunning = true;
      console.log(`Process block ${height}`);

      const fundings = await buildFundings(transactions);
    //   const balancesHash = buildBalancesHash(fundings);
      await Promise.each(fundings, tx => fundingsCtroller.Save(tx.transactionHash,tx.outputIndex,tx.blockHeight,tx.amount,tx.addressId));
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
  
  monitorNetwork()
    .then(registerSignals)
    .catch((err) => {
      console.log(err);
      process.exit(1);
    });

    async function shutdown() {

          process.exit(0);
    }
  


