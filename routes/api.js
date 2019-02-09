/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

let ApiHandler = require('../app/controllers/apiHandler');

var expect = require('chai').expect;
var MongoClient = require('mongodb');

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {


  app.route('/api/stock-prices')
    .get(function (req, res){
      console.log(req.params, req.body, req.query);
    });
    
};
