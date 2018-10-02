//todo add check for required headers on authenticate.
var buddyServer = (function(){
    const http = require('http');
    const database = require('./db');
    const Transaction = require('./transaction');
    const Strain = require('./strain');
    const BtcXfer = require('./transfer');
    const Buyer = require('./buyer');
    const Vendor = require('./vendor');
    const BtcOrder = require('./order');
    const Inventory = require('./inventory');
    const Stash = require('./stash');
    const ACCOUNTS = 'outlawdesigns.ddns.net';
    const ACCOUNTPORT = 9661;
    var db = new database('localhost','root','','buddy_test');
    function httpRequest(host,method,endpoint,params){
        return new Promise(function(resolve, reject){
            var options = {
                hostname:host,
                port:ACCOUNTPORT,
                path:'/' + endpoint,
                method:method,
                headers:{
                    'Content-Type':'application/json; charset=utf-8',
                    "Content-Length": Buffer.byteLength(JSON.stringify(params)),
                }
            };
            if(endpoint === 'authenticate'){
                options.headers.request_token = params.username;
                options.headers.password = params.password;
            }else{
                options.headers.auth_token = params.auth_token;
            }
            var req = http.request(options,function(response){
                var data = '';
                response.on('data',function(chunk){
                    data += chunk;
                });
                response.on('end',function(){
                    resolve(JSON.parse(data));
                });
            }).on('error',function(err){
                reject(err.message);
            });
            req.write(JSON.stringify(params));
        });
    }
    function _verifyToken(token){
        if(token === undefined){
            throw 'Token not present';
        }
        var params = {auth_token:token};
        return new Promise((resolve,reject)=>{
            httpRequest(ACCOUNTS,'GET','verify',params).then((data)=>{
                if(data.error){
                    reject(data);
                }
                resolve(data);
            },(err)=>{
                reject(err);
            });
        });
    }
    return {
        authenticate:function(req,res,next){
            var params = {
                username:req.headers.request_token,
                password:req.headers.password
            };
            httpRequest(ACCOUNTS,'GET','authenticate',params).then((data)=>{
                if(data.error){
                    res.send(data.error);
                    return;
                }
                res.send(data);
            });
        },
        verifyToken:function(req,res,next){
            _verifyToken(req.headers.auth_token).then((data)=>{
                res.send(req.headers.auth_token);
            },(err)=>{
                res.send(err);
            });
        },
        returnAllTransactions:function(req,res,next){
            try{
                _verifyToken(req.headers.auth_token).then((user)=>{
                    Transaction.getTransactions(user.username).then((transactions)=>{
                        res.send(transactions);
                    },(err)=>{
                        res.send(err.message);
                    });
                },(err)=>{
                    res.send(err);
                });
            }catch(err){
                res.send(err);
            }
        },
        returnTransaction:function(req,res,next){
            try{
                _verifyToken(req.headers.auth_token).then((user)=>{
                    var transaction = new Transaction(req.params.id);
                    transaction._build().then((transactionData)=>{
                        if(transactionData.user !== user.username){
                            res.send('Trying to Access Restricted Resource');
                            return;
                        }
                        res.send(transactionData);
                    },(err)=>{
                        res.send(err);
                    });
                },(err)=>{
                    res.send(err);
                });
            }catch(err){
                res.send(err);
            }
        },
        returnAllStrains:function(req,res,next){
            try{
                _verifyToken(req.headers.auth_token).then((user)=>{
                    Strain.getStrains(user.username).then((strains)=>{
                        res.send(strains);
                    },(err)=>{
                        res.send(err.message);
                    });
                },(err)=>{
                    res.send(err.message);
                });
            }catch(err){
                res.send(err);
            }
        },
        returnStrain:function(req,res,next){
            try{
                _verifyToken(req.headers.auth_token).then((user)=>{
                    var strain = new Strain(req.params.id);
                    strain._build().then((strainData)=>{
                        if(strain.user !== user.username){
                            res.send('Trying to Access Restricted Resource');
                            return;
                        }
                        res.send(strainData);
                    },(err)=>{
                        res.send(err);
                    });
                },(err)=>{
                    res.send(err);
                });
            }catch(err){
                res.send(err);
            }
        },
        createStrain:function(req,res,next){
            try{
                _verifyToken(req.headers.auth_token).then((user)=>{
                    var newStrain = req.body;
                    newStrain.user = user.username;
                    newStrain.created_date = db.date();
                    db.table('strains').insert(newStrain).execute().then((result)=>{
                        newStrain.UID = result.insertId;
                        res.send(newStrain);
                    },(err)=>{
                        res.send(err);
                    });
                },(err)=>{
                    res.send(err);
                });
            }catch(err){
                res.send(err);
            }
        },
        returnAllTransfers:function(req,res,next){
            try{
                _verifyToken(req.headers.auth_token).then((user)=>{
                    BtcXfer.getTransfers(user.username).then((transfers)=>{
                        res.send(transfers);
                    },(err)=>{
                        res.send(err);
                    });
                },(err)=>{
                    res.send(err);
                });
            }catch(err){
                res.send(err);
            }
        },
        returnTransfer:function(req,res,next){
            try{
                _verifyToken(req.headers.auth_token).then((user)=>{
                    var xfer = new BtcXfer(req.params.id);
                    xfer._build().then((xferData)=>{
                        if(xferData.user !== user.username){
                            res.send('Trying to Access Restricted Resource');
                            return;
                        }
                        res.send(xferData);
                    },(err)=>{
                        res.send(err);
                    });
                },(err)=>{
                    res.send(err);
                });
            }catch(err){
                res.send(err);
            }
        },
        returnAllOrders:function(req,res,next){
            try{
                _verifyToken(req.headers.auth_token).then((user)=>{
                    BtcOrder.getOrders(user.username).then((orders)=>{
                        res.send(orders);
                    },(err)=>{
                        res.send(err.message);
                    });
                },(err)=>{
                    res.send(err.message);
                });
            }catch(err){
                res.send(err);
            }
        },
        returnOrder:function(req,res,next){
            try{
                _verifyToken(req.headers.auth_token).then((user)=>{
                    var order = new BtcOrder(req.params.id);
                    order._build().then((orderData)=>{
                        if(orderData.user !== user.username){
                            res.send('Trying to Access Restricted Resource');
                            return;
                        }
                        res.send(orderData);
                    },(err)=>{
                        res.send(err);
                    });
                },(err)=>{
                    res.send(err);
                });
            }catch(err){res.send(errr);}
        },
        returnBuyer:function(req,res,next){
            try{
                _verifyToken(req.headers.auth_token).then((user)=>{
                    var buyer = new Buyer(req.params.id);
                    buyer._build().then((buyerData)=>{
                        if(buyerData.user !== user.username){
                            res.send('Trying to Access Restricted Resource');
                            return;
                        }
                        res.send(buyerData);
                    },(err)=>{
                        res.send(err);
                    });
                },(err)=>{
                    res.send(err);
                });
            }catch(err){
                res.send(err);
            }
        },
        returnAllBuyers:function(req,res,next){
            try{
                _verifyToken(req.headers.auth_token).then((user)=>{
                    Buyer.getBuyers(user.username).then((buyers)=>{
                        res.send(buyers);
                    },(err)=>{
                        res.send(err.message);
                    });
                },(err)=>{
                    res.send(err.message);
                });
            }catch(err){
                res.send(err);
            }
        },
        createBuyer:function(req,res,next){
            try{
                _verifyToken(req.headers.auth_token).then((user)=>{
                    var newBuyer = req.body;
                    newBuyer.user = user.username;
                    newBuyer.created_date = db.date();
                    db.table('buyers').insert(newBuyer).execute().then((result)=>{
                        newBuyer.UID = result.insertId;
                        res.send(newBuyer);
                    },(err)=>{
                        res.send(err);
                    });
                },(err)=>{
                    res.send(err);
                });
            }catch(err){
                res.send(err);
            }
        },
        returnAllVendors:function(req,res,next){
            try{
                _verifyToken(req.headers.auth_token).then((user)=>{
                    Vendor.getVendors(user.username).then((vendors)=>{
                        res.send(vendors);
                    },(err)=>{
                        res.send(err.message);
                    });
                },(err)=>{
                    res.send(err.message);
                });
            }catch(err){
                res.send(err);
            }
        },
        returnVendor:function(req,res,next){
            try{
                _verifyToken(req.headers.auth_token).then((user)=>{
                    var vendor = new Vendor(req.params.id);
                    vendor._build().then((vendorData)=>{
                        if(vendorData.user !== user.username){
                            res.send('Trying to Access Restricted Resource');
                            return;
                        }
                        res.send(vendorData);
                    },(err)=>{
                        res.send(err);
                    });
                },(err)=>{
                    res.send(err);
                });
            }catch(err){
                res.send(err);
            }
        },
        createVendor:function(req,res,next){
            try{
                _verifyToken(req.headers.auth_token).then((user)=>{
                    var newVendor = req.body;
                    newVendor.user = user.username;
                    newVendor.created_date = db.date();
                    db.table('vendors').insert(newVendor).execute().then((result)=>{
                        newVendor.UID = result.insertId;
                        res.send(newVendor);
                    },(err)=>{
                        res.send(err);
                    });
                },(err)=>{
                    res.send(err);
                });
            }catch(err){
                res.send(err);
            }
        },
        returnAllInventory:function(req,res,next){
            try{
                _verifyToken(req.headers.auth_token).then((user)=>{
                    Inventory.getInventories(user.username).then((inventories)=>{
                        res.send(inventories);
                    },(err)=>{
                        res.send(err);
                    });
                },(err)=>{
                    res.send(err);
                });
            }catch(err){
                res.send(err);
            }
        },
        returnInventory:function(req,res,next){
            try{
                _verifyToken(req.headers.auth_token).then((user)=>{
                    var inventory = new Inventory(req.params.id);
                    inventory._build().then((inventoryData)=>{
                        if(inventoryData.user !== user.username){
                            res.send('Trying to Access Restricted Resource');
                            return;
                        }
                        res.send(inventoryData);
                    },(err)=>{
                        res.send(err);
                    });
                },(err)=>{
                    res.send(err);
                });
            }catch(err){
                res.send(err);
            }
        },
        returnAllUsd:function(req,res,next){
            try{
                _verifyToken(req.headers.auth_token).then((user)=>{
                    Stash.Stash.getStashes('usd',user.username).then((stashes)=>{
                        res.send(stashes);
                    },(err)=>{
                        res.send(err);
                    });
                },(err)=>{
                    res.send(err);
                });
            }catch(err){
                res.send(err);
            }
        },
        returnUsd:function(req,res,next){
            try{
                _verifyToken(req.headers.auth_token).then((user)=>{
                    var stash = new Stash.UsdStash(req.params.id);
                    stash._build().then((stashData)=>{
                        if(stashData.user !== user.username){
                            res.send('Trying to Access Restricted Resource');
                            return;
                        }
                        res.send(stashData);
                    },(err)=>{
                        res.send(err);
                    });
                },(err)=>{
                    res.send(err);
                });
            }catch(err){
                res.send(err);
            }
        },
        returnAllBtc:function(req,res,next){
            try{
                _verifyToken(req.headers.auth_token).then((user)=>{
                    Stash.Stash.getStashes('btc',user.username).then((stashes)=>{
                        res.send(stashes);
                    },(err)=>{
                        res.send(err);
                    });
                },(err)=>{
                    res.send(err);
                });
            }catch(err){
                res.send(err);
            }
        },
        returnBtc:function(req,res,next){
            try{
                _verifyToken(req.headers.auth_token).then((user)=>{
                    var stash = new Stash.BtcStash(req.params.id);
                    stash._build().then((stashData)=>{
                        if(stashData.user !== user.username){
                            res.send('Trying to Access Restricted Resource');
                            return;
                        }
                        res.send(stashData);
                    },(err)=>{
                        res.send(err);
                    });
                },(err)=>{
                    res.send(err);
                });
            }catch(err){
                res.send(err);
            }
        },
        settleFront:function(req,res,next){
            try{
                _verifyToken(req.headers.auth_token).then((user)=>{
                    Transaction.settleFront(req.params.id).then((transaction)=>{
                        res.send(transaction._buildPublicObj());
                    },(err)=>{
                        res.send(err);
                    });
                },(err)=>{
                    res.send(err);
                });
            }catch(err){
                res.send(err);
            }
        },
        makeSale:function(req,res,next){
            try{
                _verifyToken(req.headers.auth_token).then((user)=>{
                    Transaction.makeSale(req.body.buyer,req.body.strain,req.body.amount,req.body.payment,user.username,req.body.front,req.body.discrepency).then((transactionObj)=>{
                        res.send(transactionObj._buildPublicObj());
                    },(err)=>{
                        res.send(err);
                    });
                },(err)=>{
                    res.send(err);
                });
            }catch(err){
                res.send(err);
            }
        },
        acceptTip:function(req,res,next){
            try{
                _verifyToken(req.headers.auth_token).then((user)=>{
                    Transaction.acceptTip(req.body.amount,req.body.buyer,user.username).then((stashObj)=>{
                        res.send(stashObj._buildPublicObj());
                    },(err)=>{
                        res.send(err);
                    });
                },(err)=>{
                    res.send(err);
                });
            }catch(err){
                res.send(err);
            }
        },
        makePurchase:function(req,res,next){
            try{
                _verifyToken(req.headers.auth_token).then((user)=>{
                    Transaction.makePurchase(req.body.vendor,req.body.strain,req.body.amount,req.body.payment,user.username,req.body.front).then((transactionObj)=>{
                        res.send(transactionObj._buildPublicObj());
                    },(err)=>{
                        res.send(err);
                    });
                },(err)=>{
                    res.send(err);
                });
            }catch(err){
                res.send(err);
            }
        },
        initiateXfer:function(req,res,next){
            try{
                _verifyToken(req.headers.auth_token).then((user)=>{
                    BtcXfer.initiate(req.body.stash_used,req.body.initial_rate,user.username).then((stash)=>{
                        res.send(stash);
                    },(err)=>{
                        res.send(err);
                    });
                },(err)=>{
                    res.send(err);
                });
            }catch(err){
                res.send(err);
            }
        },
        completeXfer:function(req,res,next){
            try{
                _verifyToken(req.headers.auth_token).then((user)=>{
                    BtcXfer.complete(req.body.UID,req.body.btc_gained,req.body.completion_rate).then((xfer)=>{
                        res.send(xfer);
                    },(err)=>{
                        res.send(err);
                    });
                },(err)=>{
                    res.send(err);
                });
            }catch(err){
                res.send(err);
            }
        },
        initiateOrder:function(req,res,next){
            try{
                _verifyToken(req.headers.auth_token).then((user)=>{
                    BtcOrder.initiate(req.body.vendor,req.body.strain,req.body.product_amount,req.body.btc_amount,req.body.usd_amount,req.body.btc_fees,req.body.shipping_amount_btc,req.body.shipping_amount_usd,req.body.usd_total_amount,user.username).then((orderObj)=>{
                        res.send(orderObj._buildPublicObj());
                    },(err)=>{
                        res.send(err);
                    });
                },(err)=>{
                    res.send(err);
                });
            }catch(err){
                res.send(err);
            }
        },
        completeOrder:function(req,res,next){
            try{
                _verifyToken(req.headers.auth_token).then((user)=>{
                    BtcOrder.complete(req.params.id).then((orderObj)=>{
                    res.send(orderObj._buildPublicObj());
                    },(err)=>{
                        res.send(err);
                    });
                },(err)=>{
                    res.send(err);
                });
            }catch(err){
                res.send(err);
            }
        }
    }
}());

module.exports = buddyServer;
