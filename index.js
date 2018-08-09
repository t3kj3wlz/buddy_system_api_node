const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 8854;

const buddyServer = require('../buddy_server_module');

/*Config*/
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());


/*Authentication*/
app.get('/authenticate',buddyServer.authenticate);
app.get('/verify',buddyServer.verifyToken);

/*Transactions*/
/*GET*/
app.get('/transaction',buddyServer.returnAllTransactions);
app.get('/transaction/:id',buddyServer.returnTransaction);
app.get('/transaction/front/:id',buddyServer.settleFront);
/*POST*/
app.post('/transaction/sale',buddyServer.makeSale);
app.post('/transaction/tip',buddyServer.acceptTip);
app.post('/transaction/purchase',buddyServer.makePurchase);

/*Strains*/

app.get('/strain',buddyServer.returnAllStrains);
app.get('/strain/:id',buddyServer.returnStrain);
app.post('/strain',buddyServer.createStrain);
// app.put('/strain/:id',buddyServer.updateStrain);

/*Transfers*/

app.get('/xfer',buddyServer.returnAllTransfers);
app.get('/xfer/:id',buddyServer.returnTransfer);
app.post('/xfer',buddyServer.initiateXfer);
app.put('/xfer/:id',buddyServer.completeXfer);

/*Orders*/

app.get('/order',buddyServer.returnAllOrders);
app.get('/order/:id',buddyServer.returnOrder);
app.post('/order',buddyServer.initiateOrder);
app.put('/order/:id',buddyServer.completeOrder);

/*Vendors*/

app.get('/vendor',buddyServer.returnAllVendors);
app.get('/vendor/:id',buddyServer.returnVendor);
app.post('/vendor',buddyServer.createVendor);

/*Buyers*/

app.get('/buyer',buddyServer.returnAllBuyers);
app.get('/buyer/:id',buddyServer.returnBuyer);
app.post('/buyer',buddyServer.createBuyer);

/*Inventory*/

app.get('/inventory',buddyServer.returnAllInventory);
app.get('/inventory/:id',buddyServer.returnInventory);

/*Usd Stash*/

app.get('/stash_usd',buddyServer.returnAllUsd);
app.get('/stash_usd/:id',buddyServer.returnUsd);

/*Btc Stash*/

app.get('/stash_btc',buddyServer.returnAllBtc);
app.get('/stash_btc/:id',buddyServer.returnBtc);

app.listen(PORT,()=>{
    console.log('Listening on port: ' + PORT);
});