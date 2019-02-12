'use strict';
const Stocks      = require('../model/stockPrices.js');
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
  
       //if(req.query.like) {
           //"98.254.191.29"
          var clientIp =  '101.254.175.23';
          Stocks.findOne({
             userIp: req.clientIp
            }, {
             new   : true,
             upsert: true
           }, (err, userIp) => {
            if(err) throw err;
            console.log('userIp', userIp)
            
            if(!userIp && req.query.like) {
              let user = new Stocks();
              user.userIp = req.clientIp;
              user.likes = arr;             
                     
              user.save((err, res) => {
                if(err) throw err;
                //callback(res)
                console.log('log ip address', res)
              });  
            }
            
          });
      console.log('No log ip address');      
      //callback('done');
    }; 
    
    const getLikes = (arr, callback) => {
      
         function findTicker(symbol, like) {
           let obj = {};
           
           symbol.forEach(symb => {   
             //var symb = val.toUpperCase();
             var logged = false;
             for(var i = 0; i < like.length; i++) {
               if(like[i] === symb) {
                 logged ? (
                   obj[symb]++   
                 ) : ( 
                   obj[symb] = 1,
                   logged = true
                 );
               };
             };
           });
           return obj;
         };
    
         Stocks
           .find({}, {_id: 0, likes:1})
           .exec( (err, likes) => {
             if(err) throw err;
                          
             let like = [];
             likes.map(each => each['likes'].forEach(val => like.push(val))); 
                               
             callback(findTicker(arr, like));        
           });       
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
    
    if(req.query.like) {
      queryIpDb(symbol);
    } 
    
    symbol.forEach( (symb, idx, arr) => {    
      var val = symb.toUpperCase();
      let ticker = [];
      ticker.push(val);
      stockPrices(val, function done(data) {
        let stock    = data['Global Quote'],
            objError = {error: 'Unable to find ticker'},
            error = 0;
         
        if(isEmpty(stock)) {
          stockData.push(objError);
          error++;
        } else {  
          //console.log(db)          
          let likes = symbol.length === 1 ? 'likes' : 'rel_likes';  
          stockData.push({ 'stock': val, 'price': stock['05. price'], [likes]: 0 });
        }//else         
        //console.log(stockData)
        let response;
        if(idx === arr.length-1) {  
            getLikes(symbol, function callback(db) {
              //console.log(stockData, db, db[ticker[0]])
              if(error) res.json({stockData: stockData});
              if(arr.length == 1) {
                stockData[0]['likes'] = db[val];
                response = stockData[0];
                return res.json({stockData : response})
              } else {                
                stockData[0]['rel_likes'] = db[ticker[0]] - db[ticker[1]];
                stockData[1]['rel_likes'] = db[ticker[1]] - db[ticker[0]];
                response = stockData;      
                return res.json({stockData : response})
              }
              
              
              
            });
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

/*
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

        library.find({}, (err, docs) => {
            arr.push(docs.likes);                  
            console.log(err, docs)                        
           
        })
        console.log('arr', arr)
      
      }); // MongoClient()
*/

          // let ticker = stock['01. symbol'],
          //     price  = stock['05. price'];
          // let likes = symbol.length === 1 ? 'likes' : 'rel_likes';  
          // stockData.push({ 'stock': ticker, 'price': price, [likes]:  0 });
        
        //}
        // let ipQuery;
        // if (idx === arr.length-1) {
        //   if(req.query.like) {
        //     queryIpDb(arr);
        //   }
            
           
          //getLikes(arr, function callback(db) {            
           
            
            // let response;
            // if(arr.length === 1) {
            //   response = stockData[0];
            //   response['likes'] = 0;
            // } else {
            //   stockData.forEach( (obj, index) => {
            //     obj['rel_likes'] = 0;            
            //   });
            //   response = stockData;
            // }