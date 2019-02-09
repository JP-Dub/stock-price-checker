/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

const ApiHandler = require('../app/controllers/apiHandler.js');

var expect = require('chai').expect;
var MongoClient = require('mongodb');

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  let apiHandler = new ApiHandler();
  
  app.route('/api/stock-prices')
    .get(apiHandler.getStocks)
    
};
