/***************************************************************
Underlying connection to the database
Author: Md Tauseef
****************************************************************/

var mongo = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/';
var connection = mongo.connect(url);

module.exports = connection;
