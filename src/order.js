"use strict";

const Record = require('./record');
const Stash = require('./stash');
const Inventory = require('./inventory');

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
    static initiate(vendorId,strainId,productAmount,btcAmount,usd_amount,btc_fees,btc_shipping,usd_shipping,usd_total_amount,username){
        return new Promise((resolve,reject)=>{
                var order = new BtcOrder();
                order.vendor = vendorId;
                order.strain = strainId;
                order.product_amount = productAmount;
                order.btc_amount = btcAmount;
                order.usd_amount = usd_amount;
                order.btc_fees = btc_fees;
                order.shipping_amount_btc = btc_shipping;
                order.shipping_amount_usd = usd_shipping;
                order.usd_total_amount = usd_total_amount;
                order.btc_total_amount = order.btc_amount + order.shipping_amount_btc + order.btc_fees;
                order.user = username;
                order._create().then((orderObj)=>{
                    Stash.Stash.increase('btc',-1 * Math.abs(order.btc_total_amount),username).then((stashObj)=>{
                        resolve(orderObj);
                    },(err)=>{
                        reject(err);
                    });
                },(err)=>{
                    reject(err);
                });
        });
    }
    static complete(orderId){
        return new Promise((resolve,reject)=>{
            var order = new Order(orderId);
            order._build().then((orderData)=>{
                if(order.received_date !== null){
                    reject('Cannot Double Arrive Order.');
                }
                order.received_date = order.db.date();
                order._update().then((orderObj)=>{
                    Inventory.increase(order.strain,order.product_amount).then((inventoryObj)=>{
                        resolve(order);
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

module.exports = BtcOrder;
