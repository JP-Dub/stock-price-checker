'use strict';

const apiKey = process.env.API_KEY;
const https = require('https');

function apiHandler() {
  
  this.getStocks = (req, res) => {
    console.log(req.query)
    let symbol = req.query.stock;
        
    
    //let url = 'https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=MSFT&interval=5min&apikey=' + apiKey
    const stockPrices = (symbol, done) =>{   
      let url    = 'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=' + symbol + '&apikey=' + apiKey;
      https.get(url, (res) => {
        const { statusCode } = res;
        const contentType = res.headers['content-type'];

        let error;
        if (statusCode !== 200) {
          error = new Error('Request Failed.\n' +
                            `Status Code: ${statusCode}`);
        } else if (!/^application\/json/.test(contentType)) {
          error = new Error('Invalid content-type.\n' +
                            `Expected application/json but received ${contentType}`);
        }
        if (error) {
          console.error(error.message);
          // consume response data to free up memory
          res.resume();
          return;
        }

        res.setEncoding('utf8');
        let rawData = '';
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
          try {
            const parsedData = JSON.parse(rawData);
            //console.log(parsedData);
            done(parsedData);
          } catch (e) {
            console.error(e.message);
          }
        });
      }).on('error', (e) => {
        console.error(`Got error: ${e.message}`);
      }); // end of https request
    };
    
    let stockData = [];
    Array.isArray(symbol) ? symbol.forEach( (val, idx) => {                           
        stockPrices(val, function done(stock) {
          let ticker = stock['Global Quote']['01. symbol'];
          let price = stock['Global Quote']['05. price'];
          console.log(ticker, price)
          stockData.push({'stock': ticker, 'price': price, 'rel_like' : -1});

         
         if (idx === symbol.length-1) return res.json({stockData})
          
        });
      })
      : stockPrices(symbol, function done(stock) {
          stockData = [];
          stockData.push(stock);
          res.json({stockData});
      });

    
  };
};

module.exports = apiHandler;