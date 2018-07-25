"use strict";

const Record = require('./record');

class Strain extends Record{

    constructor(id){
        const database = 'buddy_test';
        const table = 'strains';
        const primaryKey = 'UID';
        super(database,table,primaryKey,id);
        this.publicKeys = [
            'UID',
            'name',
            'thc',
            'sativa',
            'indica',
            'description',
            'inStock',
            'inventory',
            'ppg',
            'img_path',
            'created_date',
            'user'];
    }
    static getStrains(username){
        return new Promise((resolve,reject)=>{
            var strain = new Strain();
            strain.db.table(strain.table).select('*').where("user = '" + username + "'").execute().then((data)=>{
                resolve(data);
            },(err)=>{
                reject(err);
            });
        });
    }
}

module.exports = Strain;