'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Stocks = new Schema({
    userIp : String,
    likes : []
});

Stocks.set( 'toObject', {retainKeyOrder: true});
   
module.exports = mongoose.model('stock-prices', Stocks);