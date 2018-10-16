"use strict";

const Record = require('./record');
const Stash = require('./stash');

class BtcXfer extends Record{

    constructor(id){
        const database = 'buddy_test';
        const table = 'stash_transfers';
        const primaryKey = 'UID';
        super(database,table,primaryKey,id);
        this.publicKeys = [
            'UID',
            'stash_used',
            'btc_gained',
            'stash_exceeded',
            'initial_rate',
            'stash_lost',
            'completion_rate',
            'stash_gained',
            'created_date',
            'completed_date',
            'complete',
            'user'];
    }
    static getTransfers(username){
        return new Promise((resolve,reject)=>{
            var xfer = new BtcXfer();
            xfer.db.table(xfer.table).select('*').where("user = '" + username + "'").execute().then((data)=>{
                resolve(data);
            },(err)=>{
                reject(err);
            });
        });
    }
    static initiate(stashUsed,initialRate,username){
        return new Promise((resolve,reject)=>{
            Stash.Stash.increase('usd',-1 * Math.abs(stashUsed),username).then((stashObj)=>{
                var xfer = new BtcXfer();
                xfer.stash_used = stashUsed;
                xfer.initial_rate = initialRate;
                xfer.user = username;
                xfer._create().then((xferObj)=>{
                    resolve(xferObj._buildPublicObj());
                },(err)=>{
                    reject(err);
                });
            },(err)=>{
                reject(err);
            });
        });
    }
    static complete(UID,btcGained,completionRate){
        return new Promise((resolve,reject)=>{
            var xfer = new BtcXfer(UID);
            xfer._build().then((xferData)=>{
                xfer.btc_gained = btcGained;
                xfer.complete = 1;
                xfer.completion_rate = completionRate;
                xfer.completion_date = xfer.db.date();
                xfer._update().then((xferObj)=>{
                    Stash.Stash.increase('btc',btcGained,xfer.user).then((stashObj)=>{
                        resolve(xferObj._buildPublicObj());
                    },(err)=>{
                        reject(err);
                    });
                },(err)=>{
                    reject(err);
                });
            },(err)=>{
                reject(err);
            });
        });
    }
}

module.exports = BtcXfer;
