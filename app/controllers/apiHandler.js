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
         ticker    = [],
         error     = 0,
         symbol;
   
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
            symbol.forEach(val => {   
            let symb = val.toUpperCase();
            ticker.push(symb)
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
                               
             callback(findTicker(arr, like), ticker);        
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
      
      stockPrices(val, function done(data) {
        let stock    = data['Global Quote'];        
       
        if(isEmpty(stock)) {
          stockData.push({error: 'Unable to find ticker'});
          error++;
        } else {  
             
          let likes = symbol.length === 1 ? 'likes' : 'rel_likes';  
          stockData.push({ 'stock': val, 'price': stock['05. price'], [likes]: 0 });
        }        
   
        let response;
        if(idx === arr.length-1) {  
            getLikes(symbol, function callback(db, ticker) {

              if(arr.length == 1) {
                if(error) return res.json({stockData: stockData[0]});
                stockData[0]['likes'] = db[val];
                response = stockData[0];
                return res.json({stockData : response})
              } else {                 
                (error === 1) ? false : stockData[0]['rel_likes'] = db[ticker[0]] - db[ticker[1]]|| 0;
                (error === 2) ? false : stockData[1]['rel_likes'] = db[ticker[1]] - db[ticker[0]]|| 0;
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