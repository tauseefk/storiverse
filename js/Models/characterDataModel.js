/***************************************************************
Data access layer for user actions.
Author: Md Tauseef
****************************************************************/

var databaseConnection = require('./databaseConnection.js'),
  uuidV4 = require('uuid/v4'),
  getCharacterData = getCollectionByName('characterData'),
  fs = require('fs');

/***************************************************************
Utils
****************************************************************/
function log(x) {
  console.log(x);
  return x;
}

function logError(x) {
  console.error(x);
  return x;
}

function promisifiedReadFile(url, enc) {
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

/***
  * Adds dummy data to the collection for testing purposes.
  *
  */
function addDummyData() {
  return databaseConnection.connect()
  .then(getCharacterData)
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

function createCharacterCollection() {
  return databaseConnection.connect()
  .then(function(db) {
    return new Promise(function(resolve, reject){
      try {
        resolve(db.collection("characterData"));
      } catch(e) {
        console.log("table not found");
        reject(db);
      }
    });
  })
  .then(log)
  .catch(function(db) {
    console.log(db);
    db.createCollection("characterData", {
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
function getCollectionByName(name) {
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
function getRelationshipsByCharacterId(characterId) {
  return databaseConnection.connect()
  .then(getRelationshipCollection)
  .then(function(collection) {
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
      });
    });
  })
  .then(log)
  .catch(logError);
}

/***
  * Update a particular user's actions in the database.
  * @param userId: id of the userId
  * @param action: user action to be added
  *
  */
function updateUserActionsByUserId(userId, action) {
  return databaseConnection.connect()
  .then(getUserActions)
  .then(function(collection) {
    return new Promise(function(resolve, reject) {
      collection.update(
        { id: userId},
        {
          $push: { actions: action }
        },
        {},
        function(err, result) {
          if(err) {
            reject(err);
          } else {
            resolve(result);
          }
        }
      )
    });
  })
  .catch(logError);
}

/***
  * Adds new user action to existing user
  * @param userId: id of the user for adding user action.
  * @param action: user action containing name of the scene & interaction type.
  *
  */
function addUserAction(userId, action) {
  return databaseConnection.connect()
  .then(getUserActions)
  .then(function(collection) {
    return new Promise(function(resolve, reject) {
      collection.update(
        { id: userId},
        {
          $push: { actions: action }
        },
        {},
        function(err, result) {
          if(err) {
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    })
  })
  .catch(logError);
}

/***
  * Adds a new user to the database and returns a UID for the user.
  *
  */
function addUserToDatabase () {
  return new Promise(function(resolve, reject) {
    databaseConnection.connect()
    .then(getUserActions)
    .then(function(collection) {
      var generatedUserId = uuidV4();
      try {
        collection.insertOne({
          id: generatedUserId,
          actions: []
        });
      } catch(e) {
        reject(e);
      }
      resolve(generatedUserId);
    });
  });
}

/***
  * Adds a new user to the database and returns a UID for the user.
  *
  */
function addUserToFile () {
  return new Promise(function(resolve, reject) {
    databaseConnection.connect()
    .then(getUserActions)
    .then(function(collection) {
      var generatedUserId = uuidV4();
      try {
        collection.insertOne({
          id: generatedUserId,
          actions: []
        });
      } catch(e) {
        reject(e);
      }
      resolve(generatedUserId);
    });
  });
}

/***
  * Fetches the whole user actions collection
  *
  */
function getCharacterCollection() {
  return databaseConnection.connect()
  .then(getCharacterData);
}

module.exports = {
  addDummyData: addDummyData,
  addUserActionForUserId: addUserAction,
  addUserToDatabase: addUserToDatabase,
  createCharacterCollection: createCharacterCollection,
  getCharacterCollection: getCharacterCollection
}
