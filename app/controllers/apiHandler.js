'use strict';

const apiKey      = process.env.API_KEY,
      https       = require('https'),
      MongoClient = require('mongodb').MongoClient;

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});      


function apiHandler() {
  
  this.getStocks = (req, res) => {
    console.log(req.clientIp, req.query) 
          
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
            done(parsedData);
          } catch (e) {
            console.error(e.message);
          }
        });
      }).on('error', (e) => {
        console.error(`Got error: ${e.message}`);
      }); // end of https request
    };
    
    
    let stockData = [],
        symbol;
        
    Array.isArray(req.query.stock) ? symbol = req.query.stock 
                                   : symbol = [], symbol.push(req.query.stock);
    
    symbol.forEach( (val, idx) => {                           
      stockPrices(val, function done(stock) {
        let ticker = stock['Global Quote']['01. symbol'],
            price  = stock['Global Quote']['05. price'];
                  
        //symbol.length > 0 ? stockData = 'rel_likes' : stockData = 'likes';
        MongoClient.connect(CONNECTION_STRING,  { useNewUrlParser: true }, function(err, client) {
          if(err) throw err;
          
          let db      = client.db('mlab'),
              library = db.collection('stock-prices');
          library.findAndModify({
            query: { userIp : req.clientIp },
            options: { _id: 0 },
            new: true,
            upsert: true
            }, function(err, ip) {
            if(err) throw err;
            console.log('ip', ip);
          })
          
          
        });
        
        
        stockData.push({ 'stock': ticker, 'price': price });
        
        if (idx === symbol.length-1) return res.json({stockData})
          
        });
    });

    
  };
};

module.exports = apiHandler;