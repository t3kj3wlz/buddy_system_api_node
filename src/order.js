"use strict";

const Record = require('./record');

class BtcOrder extends Record{

    constructor(id){
        const database = 'buddy_test';
        const table = 'btc_orders';
        const primaryKey = 'UID';
        super(database,table,primaryKey,id);
        this.publicKeys = [
            'UID',
            'vendor',
            'strain',
            'product_amount',
            'btc_amount',
            'usd_amount',
            'shipping_amount_usd',
            'shipping_amount_btc',
            'btc_fees',
            'btc_total_amount',
            'usd_total_amount',
            'created_date',
            'shipped_Date',
            'received_date',
            'user'
        ];
    }
    static getOrders(username){
        return new Promise((resolve,reject)=>{
            var order = new BtcOrder();
            order.db.table(order.table).select('*').where("user = '" + username + "'").execute().then((data)=>{
                resolve(data);
            },(err)=>{
                reject(err);
            });
        });
    }
}

module.exports = BtcOrder;