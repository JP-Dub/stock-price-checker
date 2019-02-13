'use strict';
const Stocks      = require('../model/stockPrices.js');
const apiKey      = process.env.API_KEY,
      https       = require('https');   


function apiHandler() {
  
  this.getStocks = (req, res) => {
    //console.log(req.query)
     let stockData = [],
         ticker    = [],
         error     = false,
         errIdx    = 0,
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
            return done(parsedData);
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
            //console.log('userIp', userIp)
            
            if(!userIp && req.query.like) {
              let user = new Stocks();
              user.userIp = req.clientIp;
              user.likes = arr;             
                     
              user.save((err, res) => {
                if(err) throw err;
                console.log('log ip address')
              });  
            }
            
          });
      console.log('duplicate ip address');      
    }; 
    
    const getLikes = (arr, callback) => {
      
         function findTicker(symbol, like) {
            let obj = {}, arr = [];
            
           symbol.forEach(val => {   
             let symb   = val.toUpperCase(),
                 logged = false;
             arr.push(symb)
              
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
           
           if(stockData.length === 2) {
             if(!stockData[0].error) stockData[0].rel_likes = (obj[arr[0]] - obj[arr[1]]) || 0;        
             if(!stockData[1].error) stockData[1].rel_likes = (obj[arr[1]] - obj[arr[0]]) || 0;
           }
          
           return obj;
         };
    
         Stocks
           .find({}, {_id: 0, likes:1})
           .exec( (err, likes) => {
             if(err) throw err;
                          
             let like = [];
             likes.map(each => each['likes'].forEach(val => like.push(val))); 
                               
             callback(findTicker(arr, like), stockData);        
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
    
    var i = 0;
    while( i < symbol.length) {
      let symb = symbol[i],
          idx  = i,
          arr = symbol;
      
    //symbol.forEach( (symb, idx, arr) => {    
      let val = symb.toUpperCase();     
      
      stockPrices(val, async function done(data) {
        let stock    = await data['Global Quote'];        
        console.log( idx, stock)
        if(isEmpty(stock)) {
          stockData.push({error: 'Unable to find ticker'});
          //errIdx += idx + 1;
          error = true;
        } else {  
             
          stockData.push({ 'stock': val||null, 'price': stock['05. price']||null});//, [likes]: 0 
        }        
   
        let response;
        if(idx === arr.length-1) {
          
            getLikes(symbol, async function callback(db, stocked) {
              console.log(symbol, db)
              if(arr.length === 1) {
                response = error ? (
                  stockData[0]
                  ):( 
                  stockData[0].likes = db[val] || 0, 
                  stockData[0]
                  );
               // console.log('response', response)
                return res.json({stockData : response})
              } else {
                //console.log(stocked)
                // if(stocked.length == 2) {
                // await stocked;
                return await res.json({stockData : stocked})
               // }
                
              }
                         
            });
        }   
      });//stockPrices
      i++;
    }//);//symbol.forEach()   
  };
  
  this.deleteTestIpAddress = (req, res) => {
    Stocks
      .findOneAndDelete({userIp: req.clientIp})
      .exec(err => {
        if(err) throw err;
        return res.status(202).send('testIp deleted');
    });
  };
};

module.exports = apiHandler;

                // (error) ? (
                //   response = stockData[0] 
                // ) : (
                //   stockData[0].likes = db[val],
                //   response = stockData[0]
                // );