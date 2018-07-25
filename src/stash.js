"use strict";

const Record = require('./record');

class Stash extends Record{

    static increase(type,amount,username){
        return new Promise((resolve,reject)=>{
            Stash.getCurrent(type,username).then((currentStash)=>{
                try{
                    var newObj = Stash.createStash(type);
                }catch(err){
                    reject(err);
                }
                newObj.current_stash = currentStash.current_stash + amount;
                newObj.user = username;
                newObj._create().then((createdObj)=>{
                    resolve(createdObj);
                },(err)=>{
                    reject(err);
                });
            },(err)=>{
                reject(err);
            });
        });
    }
    static getCurrent(type,username){
        const database = require('../db');
        let db = new database('localhost','root','','buddy_test');
        let stashObj = Stash.createStash(type);
        return new Promise((resolve,reject)=>{
            db.table(stashObj.table).select('*').where("user = '" + username + "'").orderBy('UID desc limit 1').execute().then((data)=>{
                resolve(data[0]);
            },(err)=>{
                reject(err);
            });
        });
    }
    static createStash(type){
        switch (type.toLowerCase()){
            case 'usd':
                return new UsdStash();
                break;
            case 'btc':
                return new BtcStash();
                break;
            default:
                throw 'Invalid Stash Type';
        }
    }
    static getStashes(stashType,username){
        return new Promise((resolve,reject)=>{
            try{
                var stash = Stash.createStash(stashType);
            }catch(err){
                reject(err);
            }
            stash.db.table(stash.table).select('*').where("user = '" + username + "'").execute().then((data)=>{
                resolve(data);
            },(err)=>{
                reject(err);
            });
        });
    }
}

class UsdStash extends Stash{

    constructor(id){
        const database = 'buddy_test';
        const table = 'current_stash';
        const primaryKey = 'UID';
        super(database,table,primaryKey,id);
        this.publicKeys = [
            'UID',
            'teh_date',
            'current_stash',
            'legacy',
            'created_date',
            'user'
        ];
    }
}
class BtcStash extends Stash{

    constructor(id){
        const database = 'buddy_test';
        const table = 'current_stash_btc';
        const primaryKey = 'UID';
        super(database,table,primaryKey,id);
        this.publicKeys = [
            'UID',
            'current_stash',
            'created_date',
            'user'
        ];
    }
}

module.exports = {
    Stash:Stash,
    UsdStash:UsdStash,
    BtcStash:BtcStash
};

// Stash.increase('usd',40,'outlaw').then(console.log,console.log);
// var stash = new UsdStash(133);
// stash._build().then((stashData)=>{console.log(stash);},console.log);

// module.exports = Strain;