'use strict';

const apiKey = process.env.API_KEY;
const ajax = require('../common/ajax-functions.js');
const https = require('https'),
      fs = require('fs'),
      stream = require('stream');

function apiHandler() {
  this.getStocks = (req, res) => {
    console.log(req.query)
    let url = 'https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=MSFT&interval=5min&apikey=demo'
    
    https.get(url, {contentType: 'json'}, function(res) {
      
      res.on('data', (d) => {
        //let obj = JSON.parse(d);
        console.log(d)
      });
      
    });

    
  }


}

module.exports = apiHandler;