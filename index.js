const express = require('express'),
app = express(),
Routes = require('./js/routes.js'),
cors = require('cors'),
bodyParser = require('body-parser');

app.set('port', (process.env.NODE_PORT || 3000));

app.use(cors());
app.use(bodyParser.json());
app.use('/', express.static(__dirname));

app.post('/addUserResponseByQuestionId', Routes.addUserResponseByQuestionId);
app.post('/updateUserResponseByQuestionId', Routes.updateUserResponseByQuestionId);
app.post('/addUserActionByUserId', Routes.addUserActionByUserId);
app.get('/getRelationships', Routes.getRelationshipData);
app.get('/getUserData', Routes.getUserData);
app.get('/getCharacters', Routes.getCharacterData);
app.get('/getCharacterById', Routes.getCharacterById);
app.get('/getCharacterByName', Routes.getCharacterByName);
app.get('/createUser', Routes.createUser);
app.get('/createCharacterCollection', Routes.createCharacterCollection);
app.get('/addDummyCharacterData', Routes.addDummyCharacterData);
app.get('/addDummyRelationshipData', Routes.addDummyRelationshipData);
app.get('/addDummyUserData', Routes.addDummyUserData);
app.get('/createRelationshipCollection', Routes.createRelationshipCollection);
app.get('/getCharacterRelationships', Routes.getCharacterRelationships);
app.get('/getScoreForUserId', Routes.getScoreForUserId);


app.get('*', function(req, res, next) {
  var err = new Error();
  err.status = 404;
  next(err);
});

app.use(function(err, req, res, next) {
  if(err.status !== 404 && err.status !== 500) {
    return next();
  }
  res.send(err.message || '** no unicorns here **');
});

app.listen(app.get('port'), function() {
  console.log(`Node app is running on port: ${app.get('port')}`);
});
