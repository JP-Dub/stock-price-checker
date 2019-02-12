'use strict';

const apiKey      = process.env.API_KEY,
      https       = require('https'),
      MongoClient = require('mongodb').MongoClient;

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});      


function apiHandler() {
  
  this.getStocks = (req, res) => {
    //console.log(req.clientIp, req.query) 
     let stockData = [],
         symbol;      
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
    }; // end of stockPrices()
              
    const queryIpDb = (arr, callback) => {
      //console.log(symbol)
      MongoClient.connect(CONNECTION_STRING,  { useNewUrlParser: true }, function(err, client) {
        if(err) throw err;          

        let db  = client.db('mlab'),
        library = db.collection('stock-prices');
        
//         if(req.query.like) {
//            //"98.254.191.29"
//           var clientIp =  "100.255.191.29"
//           library.findOne({userIp : clientIp }, function(err, ip) {
//             if(err) throw err;

//             if(!ip) {
//               library.insertOne({userIp: clientIp, likes: arr}, (err, result) => {
//                if(err) throw err;
//                  //console.log('insertOne result', result);
//                  //callback(result)
//              });
             
//             } 
            
//           });
//         }// if(req.query.like)
        let arr = [];

        library.find({likes : {$gt : 0 }}).forEach(docs => {
            arr.push(docs.likes);                  
            console.log(docs)                        
           
        })
        console.log('arr', arr)
      
      }); // MongoClient()
    };    
                
    Array.isArray(req.query.stock) ? (
      symbol = req.query.stock 
      ):(
      symbol = [], 
      symbol.push(req.query.stock)
      );
    
    function isEmpty(obj) {
      for(var key in obj) {
        if(obj.hasOwnProperty(key)) return false;
      }
      return true;
    };
    
    //let ticker, price;
    symbol.forEach( (val, idx, arr) => {    
      
      stockPrices(val, function done(data) {
        let stock = data['Global Quote'],
            objError = {error: 'Unable to find ticker'},
            error = 0;
         
        if(isEmpty(stock)) {
          stockData.push(objError);
          error++;
        } else {
          
        let ticker = stock['01. symbol'],
            price  = stock['05. price'];
        stockData.push({ 'stock': ticker, 'price': price });
        
        }
        
        if (idx === arr.length-1) {
          
          queryIpDb(arr, function callback(db) {       
            console.log('callback', db);
            let response;
            if(arr.length === 1) {
              response = stockData[0];
              response['likes'] = 0;
            } else {
              stockData.forEach( (obj, index) => {
                obj['rel_likes'] = 0;            
              });
              response = stockData;
            }
                      
            return res.json({stockData : response})
          });//queryIpDb
        }
      });//stockPrices
    
    });//symbol.forEach()

    
  };
};

module.exports = apiHandler;

      //symbol.length > 0 ? stockData = 'rel_likes' : stockData = 'likes';

        // if(!arr.length-1) {
        //   stockData[idx]['likes'] = 1;
        // } else {    
        //   stockData[idx]['rel_likes'] = 0;              
        // }