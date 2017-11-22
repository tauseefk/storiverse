/***************************************************************
Data access layer for user actions.
Author: Md Tauseef
****************************************************************/

var connection = require('./databaseConnection.js'),
  uuidV4 = require('uuid/v4'),
  getCharacterData = getCollectionByName('characterData'),
  getRelationshipData = getCollectionByName('relationshipData'),
  getQuestionsData = getCollectionByName('questionsData'),
  characterCollection = null,
  relationshipCollection = null,
  questionsCollection = null,
  fs = require('fs');

/***************************************************************
Utils
****************************************************************/
function log (x) {
  console.log(x);
  return x;
}

function logError (x) {
  console.error(x);
  return x;
}

function promisifiedReadFile (url, enc) {
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

function promisify(callback) {
  return new Promise(function(resolve, reject) {
    var ret;
    try {
      ret = callback(...args);
    } catch(e) {
      throw e;
    }
    resolve(ret);
  });
}

/***
  * Adds dummy data to the collection for testing purposes.
  *
  */
function addDummyData () {
  return Promise.resolve()
  .then(getCharacterCollection)
  .then(function(collection) {
    promisifiedReadFile('./data/characters.json', 'utf8')
    .then(function(data) {
      JSON.parse(data).forEach(function(character){
        return collection.insertOne(character);
      });
    })
    .then(log)
    .catch(logError);
  })
  .catch(logError);
}

/***
  * Adds dummy data to the collection for testing purposes.
  *
  */
function addDummyRelationshipData () {
  return Promise.resolve()
  .then(getRelationshipCollection)
  .then(function(collection) {
    promisifiedReadFile('./data/relationshipEvents.json', 'utf8')
    .then(function(data) {
      JSON.parse(data).forEach(function(character){
        return collection.insertOne(character);
      });
    })
    .then(log)
    .catch(logError);
  })
  .catch(logError);
}

function addDummyQuestionsData () {
  return Promise.resolve()
  .then(getQuestionsCollection)
  .then(function(collection) {
    promisifiedReadFile('./data/questions.json', 'utf8')
    .then(function(data) {
      JSON.parse(data).forEach(function(question){
        return collection.insertOne(question);
      });
    })
    .catch(logError);
  })
  .catch(logError);
}

function createCharacterCollection () {
  return Promise.resolve()
  .then(getCharacterCollection)
  .catch(function(e) {
    db.createCollection("characterData", {
      capped : true,
      size : 5242880,
      max : 5000
    });
  });
}

function createRelationshipCollection () {
  return Promise.resolve()
  .then(getRelationshipCollection)
  .catch(function(e) {
    db.createCollection("relationshipData", {
      capped : true,
      size : 5242880,
      max : 5000
    });
  });
}
/***************************************************************
CRUD Operations
****************************************************************/

/***
  * Function factory for getting collection by collection name.
  * Takes the name of the collection and returns a function that
  * takes a DB connection and returns the collection.
  * @param name: name of the collection
  * @return anonymous fn that takes a DB connection and returns a collection
  *
  */
function getCollectionByName (name) {
  return function(db) {
    return new Promise(function(resolve, reject) {
      try {
        var collection = db.collection(name);
      } catch(e) {
        reject(e);
      }
      resolve(collection);
    });
  }
}

/***
  * Getting actions for a particular user, based on their userId.
  * @param userId: id of the userId
  *
  */
function getCharacterById (characterId) {
  return getCharacterCollection ()
  .then(function(collection){
    return new Promise(function(resolve, reject) {
      collection.find({
        id: characterId
      })
      .toArray(function(err, items) {
        if(err) {
          reject(err);
        } else {
          resolve(items);
        }
      })
    })
  })
}

function getValueForResponse(questionId, responseId) {
  return getQuestionsCollection()
  .then(function(collection){
    return new Promise(function(resolve, reject) {
      collection.find({
        "id": parseInt(questionId)
      })
      .toArray(function(err, items) {
        if(err) {
          reject(err);
        } else {
          var values = items.map(function(item) {
            return item.responses.filter(function(response) {
              return response.id == responseId;
            })
            .map(function(response) {
              return response.value;
            });
          })
          .concatAll();
          resolve(values);
        }
      })
    });
  });
}

/***
  * Fetches the whole characters collection
  *
  */
function getCharacterCollection () {
  if(characterCollection == null) {
    characterCollection = connection
    .then(getCharacterData);
  }
  return characterCollection;
}

/***
  * Fetches the whole relationships collection
  *
  */
function getRelationshipCollection () {
  if(relationshipCollection == null) {
    relationshipCollection = connection
    .then(getRelationshipData);
  }
  return relationshipCollection;
}

function getQuestionsCollection () {
  if(questionsCollection == null) {
    questionsCollection = connection
    .then(getQuestionsData);
  }
  return questionsCollection;
}

module.exports = {
  addDummyData: addDummyData,
  addDummyRelationshipData: addDummyRelationshipData,
  createCharacterCollection: createCharacterCollection,
  createRelationshipCollection: createRelationshipCollection,
  getCharacterCollection: getCharacterCollection,
  getRelationshipCollection: getRelationshipCollection,
  getCharacterById: getCharacterById,
  getValueForResponse: getValueForResponse,
  addDummyQuestionsData: addDummyQuestionsData,
  getQuestionsCollection: getQuestionsCollection
}
