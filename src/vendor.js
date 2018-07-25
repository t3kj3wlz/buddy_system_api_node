"use strict";

const Record = require('./record');

class Vendor extends Record{

    constructor(id){
        const database = 'buddy_test';
        const table = 'vendors';
        const primaryKey = 'UID';
        super(database,table,primaryKey,id);
        this.publicKeys = [
            'UID',
            'name',
            'ppg_key',
            'created_date',
            'user'
        ];
    }
    static getVendors(username){
        return new Promise((resolve,reject)=>{
            var vendor = new Vendor();
            vendor.db.table(vendor.table).select('*').where("user = '" + username + "'").execute().then((data)=>{
                resolve(data);
            },(err)=>{
                reject(err);
            });
        });
    }
}

module.exports = Vendor;