'use strict';

// var userActionsModel = require('./Models/userActionsModel.js');
var fs = require('fs'),
  encoding = 'utf8';

function promisifiedReadFile(url, enc = encoding) {
  return new Promise(function(resolve, reject) {
    fs.readFile(url, enc, function(err, data) {
      if(!err) {
        resolve(data);
      } else {
        reject(err);
      }
    })
  });
}

/***************************************************************
Database interaction routes
****************************************************************/

/***
  * Create a user entry in the database and return the user id
  *
  */
exports.getRelationshipsData = function(req, res) {
  promisifiedReadFile('./data/relationshipEvents.json')
  .then(function(data){
    res.send(data);
  })
  .catch(console.error.bind(this));
}
