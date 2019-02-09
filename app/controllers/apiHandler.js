'use strict';

const apiKey = process.env.API_KEY;

function apiHandler() {
  this.getStocks = (req, res) => {
    console.log(req.query)
    let url = 'https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=MSFT&interval=5min&apikey=demo'
    $.get(url, function(stock) {
      console.log(stock)
    });
    
  }


}

module.exports = apiHandler;