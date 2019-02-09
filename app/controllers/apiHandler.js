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
    
//     https.get(url, function(res) {
      
//       res.on('data', (d) => {
//         console.log(fs.createReadStream(d))
//       });
      
//     });
    https.get(url).on('data', (res) => {
      console.log(res)
    }).catch(err => {
      console.log(err)
    })
    
  }


}

module.exports = apiHandler;