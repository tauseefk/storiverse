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
  * Fetch all relationship events
  *
  */
exports.getRelationshipsData = function(req, res) {
  promisifiedReadFile('./data/relationshipEvents.json')
  .then(function(data){
    res.send(data);
  })
  .catch(console.error.bind(this));
}

/***
  * Fetch characters
  *
  */
exports.getCharactersData = function(req, res) {
  promisifiedReadFile('./data/characters.json')
  .then(function(data){
    res.send(data);
  })
  .catch(console.error.bind(this));
}
