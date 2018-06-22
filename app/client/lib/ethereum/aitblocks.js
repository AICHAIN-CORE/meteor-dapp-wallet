/**

@module Ethereum:blocks
*/



/**
The AITBlocks collection, with some ethereum additions.

@class AITBlocks
@constructor
*/



AITBlocks = new Mongo.Collection('aichain_blocks', {connection: null});

// if(typeof PersistentMinimongo !== 'undefined')
//     new PersistentMinimongo(AITBlocks);


/**
Gives you reactively the lates block.

@property latest
*/
Object.defineProperty(AITBlocks, 'latest', {
    get: function () {
        return AITBlocks.findOne({}, {sort: {number: -1}}) || {};
    },
    set: function (values) {
        var block = AITBlocks.findOne({}, {sort: {number: -1}}) || {};
        values = values || {};
        AITBlocks.update(block._id, {$set: values});
    }
});

/**
Stores all the callbacks

@property _forkCallbacks
*/
AITBlocks._forkCallbacks = [];


/**
Start looking for new blocks

@method init
*/
AITBlocks.init = function(){
    if(typeof web3 === 'undefined') {
        console.warn('AITBlocks couldn\'t find web3, please make sure to instantiate a web3 object before calling AITBlocks.init()');
        return;
    }

    // clear current block list
    AITBlocks.clear();

    Tracker.nonreactive(function() {
        observeLatestBlocks();
    });
};

/**
Add callbacks to detect forks

@method detectFork
*/
AITBlocks.detectFork = function(cb){
    AITBlocks._forkCallbacks.push(cb);
};

/**
Clear all blocks

@method clear
*/
AITBlocks.clear = function(){
    _.each(AITBlocks.find({}).fetch(), function(block){
        AITBlocks.remove(block._id);
    });
};


/**
The global block filter instance.

@property filter
*/
var filter = null;

/**
Update the block info and adds additional properties.

@method updateBlock
@param {Object} block
*/
function updateBlock(block){

    // reset the chain, if the current blocknumber is 100 blocks less 
    if(block.number + 10 < AITBlocks.latest.number)
        AITBlocks.clear();

    block.difficulty = block.difficulty.toString(10);
    block.totalDifficulty = block.totalDifficulty.toString(10);

    web3.eth.getGasPrice(function(e, gasPrice){
        if(!e) {
            block.gasPrice = gasPrice.toString(10);
            AITBlocks.upsert('bl_'+ block.hash.replace('0x','').substr(0,20), block);
        }
    });
};

/**
Observe the latest blocks and store them in the Blocks collection.
Additionally cap the collection to 50 blocks

@method observeLatestBlocks
*/
function observeLatestBlocks(){

    // get the latest block immediately
    web3.eth.getBlock('latest', function(e, block){
        if(!e) {
            updateBlock(block);
        }
    });

    // GET the latest blockchain information
    filter = web3.eth.filter('latest').watch(checkLatestBlocks);

};

/**
The observeLatestBlocks callback used in the block filter.

@method checkLatestBlocks
*/
var checkLatestBlocks = function(e, hash){
    if(!e) {
    	  AITAccounts._watchBalanceForOutCall();
    	  
        web3.eth.getBlock(hash, function(e, block){
            if(!e) {
                var oldBlock = AITBlocks.latest;

                // console.log('BLOCK', block.number);

                // if(!oldBlock)
                //     console.log('No previous block found: '+ --block.number);

                // CHECK for FORK
                if(oldBlock && oldBlock.hash !== block.parentHash) {
                    // console.log('FORK detected from Block #'+ oldBlock.number + ' -> #'+ block.number +'!');

                    _.each(AITBlocks._forkCallbacks, function(cb){
                        if(_.isFunction(cb))
                            cb(oldBlock, block);
                    });
                }

                updateBlock(block);

                // drop the 50th block
                var blocks = AITBlocks.find({}, {sort: {number: -1}}).fetch();
                if(blocks.length >= 5) {
                    var count = 0;
                    _.each(blocks, function(bl){
                        count++;
                        if(count >= 5)
                            AITBlocks.remove({_id: bl._id});
                    });
                }
            }
        });

    // try to re-create the filter on error
    // TODO: want to do this?
    } else {
        console.log(e);

        filter.stopWatching();
        filter = web3.eth.filter('latest').watch(checkLatestBlocks);
    }
};
