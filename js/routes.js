'use strict';

var fs = require('fs'),
  encoding = 'utf8',
  userActionsModel = require('./Models/userActionsModel.js'),
  characterDataModel = require('./Models/characterDataModel.js'),
  commentFile = './data/comments.json';

/***************************************************************
Only for debugging
****************************************************************/
function log(x) {
  console.log(x);
  return x;
}

function logError(x) {
  console.error(x);
  return x;
}

/***
  * Utility to flatten multi dimensional array by one dimension.
  *
  */
Array.prototype.concatAll = function() {
  var results = [];
  this.forEach(function(subArray) {
    if (Array.isArray(subArray))
      subArray.forEach((item) => results.push(item))
    else
      throw new Error('Its not two dimensional array;');
  });
  return results;
};

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

function collectionToArray(collection) {
  return new Promise(function (resolve, reject) {
    collection.find({})
    .toArray(function(err, items) {
      if(err) {
        reject(err);
      } else {
        resolve(items);
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
function getRelationshipData (req, res) {
  characterDataModel.getRelationshipCollection()
  .then(collectionToArray)
  .then(function(data){
    res.send(data);
  })
  .catch(console.error.bind(this));
}

/***
  * Fetch characters
  *
  */
function getCharacterData (req, res) {
  characterDataModel.getCharacterCollection()
  .then(collectionToArray)
  .then(function(data) {
    res.send(data);
  })
  .catch(console.error.bind(this));
}

/***
  * Fetch user data
  *
  */
function getUserData (req, res) {
  userActionsModel.getUserActionCollection()
  .then(collectionToArray)
  .then(function(data) {
    res.send(data);
  })
  .catch(console.error.bind(this));
}

/***
  * Fetch user data for id
  *
  */
function getUserActionsByUserId (req, res) {
  userActionsModel.getUserActionsByUserId(req.query.id)
  .then(function(data) {
    res.send(data);
  })
  .catch(console.error.bind(this));
}

/***
  * Fetch character by name
  *
  */
function getCharacterByName (req, res) {
  characterDataModel.getCharacterCollection()
  .then(function(collection){
    collection.find({
      name: req.query.characterName
    })
    .toArray(function(err, items) {
      if(err) {
        res.send(err);
      } else {
        res.send(items);
      }
    })
  })
  .catch(console.error.bind(this));
}

/***
  * Fetch character by id
  *
  */
function getCharacterById (req, res) {
  characterDataModel.getCharacterById(parseInt(req.query.id))
  .then(function(characters) {
    res.send(characters);
  })
  .catch(function(e) {
    res.send(e);
  });
}

// TODO:XXX refactor, it looks like it can be better
function getCharacterRelationships (req, res) {
  var tempCharacters;
  var finalCharacterSet = new Set();
  characterDataModel.getCharacterCollection()
  .then(collectionToArray)
  .then(function(characters) {
    tempCharacters = characters;
    return characters.filter(function(character) {
      return character.id == req.query.id;
    })
  })
  .then(function(char) {
    char[0].relationships.forEach(function(charId) {
      tempCharacters.filter(function(character) {
        return character.id == charId;
      })
      .forEach(function(char) {
        finalCharacterSet.add(char);
      });
    })
  })
  .then(function() {
    res.send(Array.from(finalCharacterSet));
  })
  .catch(console.error.bind(this));
}

/***
  * Create a user entry in the database and return the user id
  *
  */
function createUser (req, res) {
  userActionsModel.addUserToDatabase()
  .then(function(response) {
    res.send(JSON.stringify(response));
  })
  .catch(console.error.bind(this));
}

// TODO:XXX
function addUserResponseByQuestionId (req, res, next) {
  var requestObj = {
    userId: req.body.id,
    questionId: req.body.questionId,
    responseId: req.body.responseId
  }
  userActionsModel.addUserResponseByQuestionId(
    req.body.id,
    req.body.questionId,
    req.body.responseId
  )
  .then(function(data) {
    res.send(data);
  })
  .catch(function(e) {
    next(e);
  })
}

// TODO:XXX
function updateUserResponseByQuestionId (req, res, next) {
  var requestObj = {
    userId: req.body.id,
    questionId: req.body.questionId,
    responseId: req.body.responseId
  }
  userActionsModel.updateUserResponseByQuestionId(
    req.body.id,
    req.body.questionId,
    req.body.responseId
  )
  .then(function(data) {
    res.send(data);
  })
  .catch(function(e) {
    if(data.name == "MongoError") {
      return userActionsModel.addUserResponseByQuestionId(
        req.body.id,
        req.body.questionId,
        req.body.responseId
      ).then(function(data) {
        res.send(data);
      })
      .catch(function (e){
        next(e);
      });
    } else {
      next(e);
    }
  })
}

function addUserActionByUserId (req, res, next) {

}

function getScoreForUserId(req, res, next) {
  userActionsModel.getUserActionsByUserId(req.query.id)
  .then(function(userActions) {
    return userActions.map(function(userAction){
      return userAction.actions.map(function(action){
        return {
          questionId: action.questionId,
          responseId: action.responseId
        };
      });
    })
    .concatAll();
  })
  .then(function(filteredActions) {
    var things = filteredActions.map(function(filteredAction) {
      return characterDataModel.getValueForResponse(filteredAction.questionId,
        filteredAction.responseId);
    });
    return Promise.all(things);
  })
  .then(function(values) {
    res.send(JSON.stringify(values.concatAll()));
  })
  .catch(logError);
}

function createCharacterCollection (req, res) {
  characterDataModel.createCharacterCollection()
  .then(function() {
    res.send("Collection made!");
  })
  .catch(function(e) {
    res.send(e);
  });
}

function createRelationshipCollection (req, res) {
  characterDataModel.createRelationshipCollection()
  .then(function() {
    res.send("Collection made!");
  })
  .catch(function(e) {
    res.send(e);
  });
}

function createUserActionCollection (req, res) {
  userActionsModel.createUserActionCollection()
  .then(function() {
    res.send("Collection made!");
  })
  .catch(function(e) {
    res.send(e);
  });
}

function addDummyCharacterData (req, res) {
  characterDataModel.addDummyData()
  .then(function() {
    res.send("Collection made!");
  })
  .catch(function(e) {
    res.send(e);
  });
}

function addDummyRelationshipData (req, res) {
  characterDataModel.addDummyRelationshipData()
  .then(function() {
    res.send("Collection made!");
  })
  .catch(function(e) {
    res.send(e);
  });
}

function addDummyQuestionsData (req, res) {
  characterDataModel.addDummyQuestionsData()
  .then(function() {
    res.send("Collection made!");
  })
  .catch(function(e) {
    res.send(e);
  });
}

function addDummyUserData (req, res) {
  userActionsModel.addDummyUserData()
  .then(function(response) {
    res.send(response);
  })
  .catch(function(e) {
    next(e);
  });
  res.send("dummy data added!");
}

function getQuestionsData(req, res) {
  characterDataModel.getQuestionsCollection()
  .then(collectionToArray)
  .then(function(questions) {
    res.send(questions);
  })
  .catch(logError);
}

module.exports = {
  getCharacterData: getCharacterData,
  getRelationshipData: getRelationshipData,
  getUserData: getUserData,
  getUserActionsByUserId: getUserActionsByUserId,
  getCharacterById: getCharacterById,
  getCharacterByName: getCharacterByName,
  createUser: createUser,
  createCharacterCollection: createCharacterCollection,
  createRelationshipCollection: createRelationshipCollection,
  createUserActionCollection: createUserActionCollection,
  addDummyCharacterData: addDummyCharacterData,
  addDummyRelationshipData: addDummyRelationshipData,
  addDummyUserData: addDummyUserData,
  getCharacterRelationships: getCharacterRelationships,
  addUserResponseByQuestionId: addUserResponseByQuestionId,
  updateUserResponseByQuestionId: updateUserResponseByQuestionId,
  addUserActionByUserId: addUserActionByUserId,
  getScoreForUserId: getScoreForUserId,
  addDummyQuestionsData: addDummyQuestionsData,
  getQuestionsData: getQuestionsData
}
