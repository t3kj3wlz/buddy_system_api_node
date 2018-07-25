"use strict";

const Record = require('./record');

class Buyer extends Record{

    constructor(id){
        const database = 'buddy_test';
        const table = 'buyers';
        const primaryKey = 'UID';
        super(database,table,primaryKey,id);
        this.publicKeys = [
            'UID',
            'buyer',
            'legacy',
            'active',
            'created_date',
            'user'
        ];
    }
    static getBuyers(username){
        return new Promise((resolve,reject)=>{
            var buyer = new Buyer();
            buyer.db.table(buyer.table).select('*').where("user = '" + username + "'").execute().then((data)=>{
                resolve(data);
            },(err)=>{
                reject(err);
            });
        });
    }
}

module.exports = Buyer;