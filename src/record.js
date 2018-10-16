"use strict";

class Record{

    constructor(db,table,primaryKey,id){
        const database = require('./db');
        this.database = db;
        this.table = table;
        this.primaryKey = primaryKey;
        this.id = id;
        this.db = new database('localhost','root','',this.database);
    }
    _build(){
        return new Promise((resolve,reject)=>{
            this.db.table(this.table).select('*').where(this.primaryKey + "= '" + this.id + "'").execute().then((data)=>{
                let keys = Object.keys(data[0]);
                keys.forEach((key)=>{
                    this[key] = data[0][key];
                });
                resolve(data[0]);
            },(err)=>{
                reject(err);
            });
        });
    }
    _buildPublicObj(){
        let obj = {};
        this.publicKeys.forEach((key)=>{
            obj[key] = this[key];
            if(key === 'teh_date' && isNaN(Date.parse(this[key]))){
                obj[key] = Record._getTehDate();
            }else if(key === 'teh_date'){
                obj[key] = Record._getTehDate(this[key]);
            }
            if(key === 'created_date' && isNaN(Date.parse(this[key]))){
                obj[key] = this.db.date();
            }else if(key === 'created_date'){
                obj[key] = this.db.date(this[key]);
            }
            if(key === 'completion_date' && isNaN(Date.parse(this[key]))){
                obj[key] = this.db.date();
            }else if(key === 'completion_date'){
                obj[key] = this.db.date(this[key]);
            }
        });
        return obj;
    }
    _update(){
        return new Promise((resolve,reject)=>{
            let update = this._buildPublicObj();
            this.db.table(this.table).update(update).where(this.primaryKey + "= '" + this.id + "'").execute().then((data)=>{
                this._build().then((data)=>{
                    resolve(this);
                },(err)=>{
                    reject(err);
                });
            },(err)=>{
                reject(err);
            });
        });
    }
    _create(){
        return new Promise((resolve,reject)=>{
            let insertion = this._buildPublicObj();
            this.db.table(this.table).insert(insertion).execute().then((data)=>{
                this._getId().then((lastId)=>{
                    this.id = lastId[0][this.primaryKey];
                    this._build().then((data)=>{
                        resolve(this);
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
    _getId(){
        return new Promise((resolve,reject)=>{
            this.db.table(this.table).select(this.primaryKey).orderBy(this.primaryKey + " desc limit 1").execute().then((data)=>{
                resolve(data);
            },(err)=>{
                reject(err);
            });
        });
    }
    static _getTehDate(dateStr){
        var dateObj = (dateStr === undefined) ? new Date() : new Date(dateStr);
        var month = dateObj.getUTCMonth() + 1; //months from 1-12
        var day = dateObj.getUTCDate();
        var year = dateObj.getUTCFullYear();
        if(month <= 9){
            month = '0' + month;
        }
        return year + "-" + month + "-" + day;
    }
}

module.exports = Record;
