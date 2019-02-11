'use strict';

//var appUrl = window.location.origin;

let ajax = {
   ready: function ready (fn) {
      if (typeof fn !== 'function') {
         return;
      }

      if (document.readyState === 'complete') {
         return fn();
      }

      document.addEventListener('DOMContentLoaded', fn, false);
   },
   request: function ajaxRequest (method, url, callback) {
      var xmlhttp = new XMLHttpRequest();
      
      xmlhttp.onreadystatechange = function () {
         if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            callback(xmlhttp.response);
         }
      };

      xmlhttp.open(method, url, true);
      xmlhttp.send();
   }
};

module.exports = ajax;

/*

userIp : Number,
ticker : Goog
/*