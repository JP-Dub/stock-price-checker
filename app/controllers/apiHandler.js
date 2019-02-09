'use strict';
/* global $, ajax */
const apiKey = process.env.API_KEY;
const ajax = require('../common/ajax-functions.js');

function apiHandler() {
  this.getStocks = (req, res) => {
    console.log(req.query)
    let url = 'https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=MSFT&interval=5min&apikey=demo'
    
    ajax.ready(ajax.request('GET', url, function(stock) {
       console.log(stock)
      
    }));
    
  }


}

module.exports = apiHandler;