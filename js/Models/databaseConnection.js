/***************************************************************
Underlying connection to the database
Author: Md Tauseef
Mongo returns a Promise if no callback is passed as an argument
to the connect API.
****************************************************************/

var mongo = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/';
var connection = mongo.connect(url);

module.exports = connection;
