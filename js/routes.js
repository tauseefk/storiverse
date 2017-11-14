'use strict';

var fs = require('fs'),
  encoding = 'utf8',
  userActionsModel = require('./Models/userActionsModel.js'),
  characterDataModel = require('./Models/characterDataModel.js'),
  commentFile = './data/comments.json';

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
    next(e);
  })
}

function addUserActionByUserId (req, res, next) {
  res.send("blah");
}

function getScoreForUserId(req, res, next) {

}

/***
  * Post comments for an item
  *
  */
function postCommentForItemId (req, res) {
  promisifiedWriteFile(commentFile, req.data.content)
  .then(function(data) {
    res.send(JSON.stringify(data));
  })
  .catch(console.error.bind(this));
}

/***
  * Add user action to the user in the database
  *
  */
function postCommentForItemId2 (req, res) {
  var comment = {
    sceneName: req.body.sceneName,
    interactionType: req.body.interactionType
  }
  userActionsModel.addCommentForUserId(req.body.userId, req.body.itemId, userAction);
  res.send("Comment posted");
}

function createCharacterCollection (req, res) {
  characterDataModel.createCharacterCollection();
  res.send("collection made");
}

function createRelationshipCollection (req, res) {
  characterDataModel.createRelationshipCollection();
  res.send("collection made");
}

function createUserActionCollection (req, res) {
  try {
    userActionsModel.createUserActionCollection();
  } catch(e) {
    res.send(e);
  }
  res.send("Collection made!");
}

function addDummyCharacterData (req, res) {
  characterDataModel.addDummyData();
  res.send("dummy data added!")
}

function addDummyRelationshipData (req, res) {
  characterDataModel.addDummyRelationshipData();
  res.send("dummy data added!");
}

function addDummyUserData (req, res) {
  userActionsModel.addDummyUserData();
  res.send("dummy data added!");
}

module.exports = {
  getCharacterData: getCharacterData,
  getRelationshipData: getRelationshipData,
  getUserData: getUserData,
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
  getScoreForUserId: getScoreForUserId
}
