/***************************************************************
Underlying connection to the database
Author: Md Tauseef
****************************************************************/

var mongo = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/';

module.exports.connect = function(callback) {
  return mongo.connect(url);
}
