'use strict';

// var userActionsModel = require('./Models/userActionsModel.js');
var fs = require('fs');

/***************************************************************
Database interaction routes
****************************************************************/

/***
  * Create a user entry in the database and return the user id
  *
  */
exports.getRelationshipsData = function(req, res) {
  fs.readFile('./data/relationshipEvents.json', 'utf8', function(err, relationships) {
      if(!err) {
          res.send(JSON.parse(relationships));
      } else {
          throw err;
      }
  })
}
