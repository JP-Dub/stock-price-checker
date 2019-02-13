/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    
    suite('GET /api/stock-prices => stockData object', function() {
      
      test('1 stock', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog'})
        .end(function(err, res){
         console.log(res.body.stockData)
          assert.equal(res.status, 200);
          assert.isObject(res.body, 'should return and object');
          assert.propertyVal(res.body.stockData, 'stock', 'GOOG');         
          done();
        });
      });
      
      test('1 stock with like', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'MGPI', like: true})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isObject(res.body, 'should return and object');
          assert.propertyVal(res.body.stockData, 'stock', 'MGPI');
          assert.propertyVal(res.body.stockData, 'likes', 1);
          done();
        });        
      });
      
      test('1 stock with like again (ensure likes arent double counted)', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'MGPI', like: true})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isObject(res.body, 'should return and object');
          assert.propertyVal(res.body.stockData, 'stock', 'MGPI');
          assert.propertyVal(res.body.stockData, 'likes', 1);
          done();
        });          
      });
      
      test('Delete Ip Address for tests', function(done) {
       chai.request(server)
        .delete('/api/stock-prices')
        .end(function(err, res){
          assert.equal(res.status, 202);
          assert.equal(res.text, 'testIp deleted');
          done();
        });          
      });      
      
      // test('2 stocks', function(done) {
      //   chai.request(server)
      //     .get('/api/stock-prices')
      //     .query({stock: ['GOOG', 'AMZN']})
      //     .end(function(err, res){
      //      console.log('test' , res.body.stockData)
      //       assert.equal(res.status, 200);
      //       assert.isObject(res.body, 'should return and object');
      //       assert.propertyVal(res.body.stockData[0], 'stock', 'GOOG');
      //       assert.propertyVal(res.body.stockData[1], 'stock', 'AMZN');
      //       done();
      //   });          
      // });
      
      test('2 stocks with like', function(done) {
        chai.request(server)
          .get('/api/stock-prices')
          .query({stock: ['AAPL', 'AMZN'], like: true})
          .end(function(err, res){
           console.log('test' , res.body.stockData)
            assert.equal(res.status, 200);
            assert.isObject(res.body, 'should return and object');
            assert.propertyVal(res.body.stockData[0], 'stock', 'AAPL');
            assert.isNumber(res.body.stockData[0].rel_likes, 'is a number');
            assert.propertyVal(res.body.stockData[1], 'stock', 'AMZN');
            assert.isNumber(res.body.stockData[1].rel_likes, 'is a number');
            done();
        });            
      });

      test('Delete Ip Address for tests', function(done) {
        chai.request(server)
          .delete('/api/stock-prices')
          .end(function(err, res){
            assert.equal(res.status, 202);
            assert.equal(res.text, 'testIp deleted');
            done();
        });          
      });        
      
    });

});
