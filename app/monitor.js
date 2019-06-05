const Promise = require('bluebird');
const startBlockHeight=579271;
var blockCtroller = require('../controller/block');
var fundingsCtroller = require('../controller/funding');

var api = require('../controller/api');
var utils = require('../controller/utils');


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
        if (!this.isRunning) return;
        const txs = await api.getTxsByHeight(height);
        const transactions = [];

        await Promise.each(txs, async (tx) => {
          let transactionRaw = null;
          try {
            transactionRaw = await api.getRawTx(tx);
            const parsedTx = await utils.parseTransaction(transactionRaw, tx);
            if (parsedTx.valid) transactions.push(parsedTx);
          } catch (error) {
            // ư\this.debug("error ",error);
            transactionRaw = null;
          }
        });
        if (transactions.length > 0) {
          const nextBlock = { hash: transactions[0].blockHash, height, transactions };
          this.nextBlocks.push(nextBlock);
        }
      },
      { concurrency: 5 },
    );
  }

  async function shouldProcessNextBlock(fromHeight, toHeight) {
    // Pre-validate
    if (!isRunning || fromHeight > toHeight) return false;

    // Validate next block
    const nextBlock = nextBlocks.peek();
    if (validateBlock(nextBlock, fromHeight, toHeight)) return true;
    await Promise.delay(1000 * 10);
    return shouldProcessNextBlock(fromHeight, toHeight);
  }

  async function processRange(fromHeight, toHeight) {
    if (await shouldProcessNextBlock(fromHeight, toHeight)) {
      const nextBlock = nextBlocks.pop();
      await processBlock(nextBlock);
      await processRange(nextBlock.height + 1, toHeight);
    }
  }

  async function processBlock({ height, transactions }) {
    await db.transaction(async (trx) => {
      const fundings = await buildFundings(transactions);
    //   const balancesHash = buildBalancesHash(fundings);
      await Promise.each(fundings, tx => fundings.Save(tx.transactionHash,tx.outputIndex,tx.blockHeight,tx.amount,tx.addressId));
      await blockCtroller.Update( height);

    });
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
  


