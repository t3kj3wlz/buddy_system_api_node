"use strict";

const Record = require('./record');

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
}

module.exports = BtcXfer;