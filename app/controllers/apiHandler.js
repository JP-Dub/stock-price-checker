'use strict';

const apiKey = process.env.API_KEY;
const ajax = require('../common/ajax-functions.js');
const https = require('https'),
      fs = require('fs'),
      stream = require('stream');
      //Buffer = require('buffer');

function apiHandler() {
  this.getStocks = (req, res) => {
    console.log(req.query)
    let url = 'https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=MSFT&interval=5min&apikey=demo'
    
    https.get(url, {contentType: 'application/json; charset=utf-8'}, function(res, success) {
      console.log(res, success)
      res.on('data', (d) => {
        console.log(d)
        const buff = Buffer.from(d)
        //const json = JSON.stringify(buff);
        //const buf = Buffer.from([0x1, 0x2, 0x3, 0x4, 0x5]);
       const json = JSON.stringify(buff);

//console.log(json);
// Prints: {"type":"Buffer","data":[1,2,3,4,5]}

const copy = JSON.parse(json, (key, value) => {
  return value && value.type === 'Buffer' ?
    Buffer.from(value.data) :
    value;
});

//console.log(copy);
      });
      
    });

    
  }


}

module.exports = apiHandler;