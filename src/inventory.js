"use strict";

const Record = require('./record');
const Strain = require('./strain');

class Inventory extends Record{

    constructor(id){
        const database = 'buddy_test';
        const table = 'current_inventory';
        const primaryKey = 'UID';
        super(database,table,primaryKey,id);
        this.publicKeys = [
            'UID',
            'teh_date',
            'current_inventory',
            'legacy',
            'created_date',
            'user'
        ];
    }
    static increase(strainId,amount){
        return new Promise((resolve,reject)=>{
            let strain = new Strain(strainId);
            strain._build().then((strainData)=>{
                strain.inventory += amount;
                if(strain.inventory < 0){
                    reject('Cannot create negative inventory');
                }else if(strain.inventory === 0){
                    strain.inStock = 0;
                }else{
                    strain.inStock = 1;
                }
                strain._update().then((updatedStrain)=>{
                    Inventory.updateInventory(updatedStrain.user).then((newInventoryObj)=>{
                        resolve(updatedStrain);
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
    static calculateCurrentInventory(username){
        return new Promise((resolve,reject)=>{
            var inventory = 0;
            Strain.getStrains(username).then((strains)=>{
                strains.forEach((strain)=>{
                    if(strain.inStock) inventory += strain.inventory;
                });
                resolve(inventory);
            },(err)=>{
                reject(err);
            });
        });
    }
    static updateInventory(username){
        return new Promise((resolve,reject)=>{
            Inventory.calculateCurrentInventory(username).then((totalInventory)=>{
                var inventory = new Inventory();
                inventory.current_inventory = totalInventory;
                inventory.user = username;
                inventory._create().then((createdInventory)=>{
                    resolve(createdInventory);
                },(err)=>{
                    reject(err);
                });
            },(err)=>{
                reject(err);
            });
        });
    }
    static getInventories(username){
        return new Promise((resolve,reject)=>{
            var inventory = new Inventory();
            inventory.db.table(inventory.table).select('*').where("user = '" + username + "'").execute().then((data)=>{
                resolve(data);
            },(err)=>{
                reject(err);
            });
        });
    }
}

module.exports = Inventory;

// Inventory.calculateCurrentInventory('outlaw').then(console.log,console.log);

// Inventory.increase(2,7).then(console.log,console.log);