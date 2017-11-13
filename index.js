const express = require('express'),
  app = express(),
  Routes = require('./js/routes.js'),
  cors = require('cors'),
  bodyParser = require('body-parser');

app.set('port', (process.env.NODE_PORT || 3000));

app.use(cors());
app.use(bodyParser.json());
app.use('/', express.static(__dirname));

app.get('/getRelationships', Routes.getRelationshipData);
app.get('/getCharacters', Routes.getCharacterData);
app.get('/getCharacterById', Routes.getCharacterById);
app.get('/getCharacterByName', Routes.getCharacterByName);
app.get('/createUser', Routes.createUser);
app.get('/addDummyData', Routes.addDummyData);
app.get('/createCharacterCollection', Routes.createCharacterCollection);
app.get('/addDummyRelationshipData', Routes.addDummyRelationshipData);
app.get('/createRelationshipCollection', Routes.createRelationshipCollection);
app.get('/getCharacterRelationships', Routes.getCharacterRelationships);

app.listen(app.get('port'), function() {
  console.log(`Node app is running on port: ${app.get('port')}`);
});
