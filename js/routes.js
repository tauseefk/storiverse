'use strict';

// var userActionsModel = require('./Models/userActionsModel.js');
var fs = require('fs'),
  encoding = 'utf8',
  userActionsModel = require('./Models/userActionsModel.js'),
  commentFile = './data/comments.json';

function promisifiedReadFile(url, enc = encoding) {
  return new Promise(function(resolve, reject) {
    fs.readFile(url, enc, function(err, data) {
      if(!err) {
        resolve(data);
      } else {
        reject(err);
      }
    });
  });
}

function promisifiedWriteFile(url, content) {
  return new Promise(function(resolve, reject) {
    fs.writeFile(url, content, function(err) {
      if(!err) {
        resolve("Successfully written to file.");
      } else {
        reject(err);
      }
    });
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

/***
  * Create a user entry in the database and return the user id
  *
  */
exports.createUser = function(req, res) {
  userActionsModel.addUserToDatabase()
  .then(function(response) {
    res.send(JSON.stringify(response));
  })
  .catch(console.error.bind(this));
}

/**
 * fetch item for an episode
 *
 */
exports.fetchItemForEpisode = function(req, res) {
  promisifiedReadFile('./data/items.json')
  .then(function(data) {
    return data.filter(function(item){
      return item.episodeId == req.data.episodeId;
    })
  })
  .then(function(items) {
    var itemIdx = Math.random() * (2 - 0) + 0;
    res.send(JSON.stringify(items[itemIdx]));
  })
  .catch(console.error.bind(this));
}

/**
 * Post comments for an item
 *
 */
 exports.postCommentForItemId = function(req, res) {
   promisifiedWriteFile(commentFile, req.data.content)
   .then(function(data) {
     res.send(JSON.stringify(data));
   })
   .catch(console.error.bind(this));
 }

 /**
  * Fetch comments for episode box
  *
  */
