"use strict";

const Record = require('./record');
const Buyer = require('./buyer');
const Vendor = require('./vendor');
const Strain = require('./strain');
const Stash = require('./stash');
const Inventory = require('./inventory');

class Transaction extends Record{

    constructor(id){
        const database = 'buddy_test';
        const table = 'Transactions';
        const primaryKey = 'UID';
        super(database,table,primaryKey,id);
        this.publicKeys = [
            'UID',
            'teh_date',
            'trans_type',
            'product_amount',
            'payment',
            'front',
            'buyer',
            'discrepency',
            'legacy',
            'created_date',
            'strain',
            'front_paid',
            'user'
        ];
    }
    static add(type,amount,payment,buyerId,strainId,username,front,discrepency){
        return new Promise((resolve,reject)=>{
            const approvedTypes = ['T','S','P'];
            var transaction = new this();
            var buyerObj = {};
            var strainObj = {};
            var vendorFlag = false;
            transaction.teh_date = Record._getTehDate();
            transaction.product_amount = amount;
            transaction.payment = payment;
            transaction.user = username;
            transaction.discrepency = discrepency;
            transaction.legacy = 0;
            if(approvedTypes.indexOf(type) === -1){
                throw 'Invalid Transaction Type';
            }
            transaction.trans_type = type;
            if(strainId > 0){
                strainObj = new Strain(strainId);
                strainObj._build().then((strainData)=>{
                    transaction.strain = strainData.name;
                    if(buyerId === 0){
                        transaction.buyer = 'Me';
                        transaction._create().then((newTransaction)=>{resolve(newTransaction);},(err)=>{reject(err);});
                    }else if(buyerId < 0){
                        vendorFlag = true;
                        buyerObj = new Vendor(Math.abs(buyerId));
                    }else{
                        buyerObj = new Buyer(buyerId);
                    }
                    buyerObj._build().then((buyerData)=>{
                        transaction.buyer = vendorFlag ? buyerData.name : buyerData.buyer;
                        transaction._create().then((newTransaction)=>{
                            resolve(newTransaction);
                        },(err)=>{
                            reject(err);
                        });
                    },(err)=>{
                        reject(err);
                    });
                },(err)=>{
                    reject(err);
                });
            }else{
                transaction.strain = 'N/A';
                if(buyerId === 0){
                    transaction.buyer = 'Me';
                    transaction._create().then((newTransaction)=>{resolve(newTransaction);},(err)=>{reject(err);});
                    return;
                }else if(buyerId < 0){
                    vendorFlag = true;
                    buyerObj = new Vendor(Math.abs(buyerId));
                }else{
                    buyerObj = new Buyer(buyerId);
                }
                buyerObj._build().then((buyerData)=>{
                    transaction.buyer = vendorFlag ? buyerData.name : buyerData.buyer;
                    transaction._create().then((newTransaction)=>{
                        resolve(newTransaction);
                    },(err)=>{
                        reject(err);
                    });
                },(err)=>{
                    reject(err);
                });
            }
        });
    }
    static makeSale(buyerId,strainId,amount,payment,username,front,discrepency){
        return new Promise((resolve,reject)=>{
            if(buyerId !== 0 && !front && !discrepency){
                Stash.Stash.increase('usd',payment,username).then((stashResult)=>{
                    Inventory.increase(strainId,-1 * Math.abs(amount)).then((inventoryResult)=>{
                        Transaction.add('S',amount,payment,buyerId,strainId,username,front,discrepency).then((transactionResult)=>{
                            resolve(transactionResult);
                        },(err)=>{
                            reject(err);
                        });
                    },(err)=>{
                        reject(err);
                    });
                },(err)=>{
                    reject(err);
                });
            }else{
                Inventory.increase(strainId,-1 * Math.abs(amount)).then((inventoryResult)=>{
                    Transaction.add('S',amount,payment,buyerId,strainId,username,front,discrepency).then((transactionResult)=>{
                        resolve(transactionResult);
                    },(err)=>{
                        reject(err);
                    });
                },(err)=>{
                    reject(err);
                });
            }
        });
    }
    static makePurchase(vendorId,strainId,amount,payment,username,front){
        vendorId = -1 * Math.abs(vendorId);
        return new Promise((resolve,reject)=>{
            if(!front){
                Stash.Stash.increase('usd',-1 * Math.abs(payment),username).then((stashResults)=>{
                    Inventory.increase(strainId,amount).then((inventoryResults)=>{
                        Transaction.add('P',amount,payment,-1 * Math.abs(vendorId),strainId,username,front).then((transactionResults)=>{
                            resolve(transactionResults);
                        },(err)=>{
                            reject(err);
                        });
                    },(err)=>{
                        reject(err);
                    });
                },(err)=>{
                    reject(err);
                });
            }else{
                Inventory.increase(strainId,amount).then((inventoryResults)=>{
                    Transaction.add('P',amount,payment,vendorId,strainId,username,front).then((transactionResults)=>{
                        resolve(transactionResults);
                    },(err)=>{
                        reject(err);
                    });
                },(err)=>{
                    reject(err);
                });
            }
        });
    }
    static acceptTip(amount,buyerId,username){
        return new Promise((resolve,reject)=>{
            Transaction.add('T',0,amount,buyerId,-1,username).then((transactionResult)=>{
                Stash.Stash.increase('usd',amount,username).then((stashResults)=>{
                    resolve(stashResults);
                },(err)=>{
                    reject(err);
                });
            },(err)=>{
                reject(err);
            });
        });
    }
    static settleFront(UID){
        return new Promise((resolve,reject)=>{
            var transaction = new Transaction(UID);
            transaction._build().then((transactionData)=>{
                if(!transactionData.front || !isNaN(Date.parse(transactionData.front_paid))) reject("Cannot settle a non front");
                if(transactionData.trans_type === 'P'){
                    Stash.Stash.increase('usd',-1 * Math.abs(transactionData.payment),transactionData.user).then((stashResults)=>{
                        transaction.front_paid = transaction.db.date();
                        transaction._update().then((updateResults)=>{
                            resolve(updateResults);
                        },(err)=>{
                            reject(err);
                        });
                    },(err)=>{
                        reject(err);
                    });
                }else{
                    Stash.Stash.increase('usd',transactionData.payment,transactionData.user).then((stashResults)=>{
                        transaction.front_paid = transaction.db.date();
                        transaction._update().then((updateResults)=>{
                            resolve(updateResults);
                        },(err)=>{
                            reject(err);
                        });
                    },(err)=>{
                        reject(err);
                    });
                }
            },(err)=>{
                reject(err);
            });
        });
    }
    static getTransactions(username){
        return new Promise((resolve,reject)=>{
            var transaction = new Transaction();
            transaction.db.table(transaction.table).select('*').where("user = '" + username + "'").execute().then((data)=>{
                resolve(data);
            },(err)=>{
                reject(err);
            });
        });
    }
}

//var t = new Transaction(133);
//t._build().then(console.log,console.log);
// Transaction.makeSale(4,2,3.5,50,'outlaw',0,0).then(console.log,console.log);
// Transaction.settleFront(1536).then(console.log,console.log);
// Transaction.makePurchase(3,1,28,235,'outlaw',false).then(console.log,console.log);

module.exports = Transaction;


