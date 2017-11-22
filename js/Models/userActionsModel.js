/***************************************************************
Data access layer for user actions.
Author: Md Tauseef
****************************************************************/

var databaseConnection = require('./databaseConnection.js');
var connection = databaseConnection.connect();
var uuidV4 = require('uuid/v4');
var getUserActions = getCollectionByName('userActionData');
var userActionCollection = null;

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

function createUserActionCollection () {
  return Promise.resolve()
  .then(getUserActionCollection)
  .then(log)
  .then(function(collection) {
    collection.drop()
  })
  .catch(function(e) {
    console.log(e);

    db.createCollection("userActionData", {
      capped : true,
      size : 5242880,
      max : 5000
    });
  });
}

/***
  * Adds dummy data to the collection for testing.
  *
  */
function addDummyData() {
  return getUserActionCollection()
  .then(function(collection) {
    var timestamp = new Date().getTime();
    return new Promise(function(resolve, reject) {
      try {
        collection.insertOne( {
          id: uuidV4(),
          actions: [
            {
              timestamp: timestamp,
              type: "question",
              questionId: 1,
              responseId: 2
            }
          ]
        });
      } catch (e) {
        reject(e);
      }
      resolve ("Data added!");
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
function getUserActionsByUserId(userId) {
  return getUserActionCollection()
  .then(function(collection) {
    return new Promise(function(resolve, reject) {
      collection.find({
        id: userId
      })
      .toArray(function(err, items) {
        if(err) {
          reject(err);
        } else {
          resolve(items);
        }
      });
    });
  });
}

/***
  * Add user's response to a question in the database.
  * @param userId: id of the userId
  * @param questionId: id of the question
  * @param responseId: id of the response
  *
  */
function addUserResponseByQuestionId(userId, questionId, responseId) {
  return getUserActionCollection()
  .then(function(collection) {
    return new Promise(function(resolve, reject) {
      collection.update(
        { id: userId},
        {
          $push: {
            actions: {
              timestamp: new Date().getTime(),
              type: "question",
              questionId: questionId,
              responseId: responseId
            }
          }
        },
        {},
        function(err, data) {
          if(err) {
            reject(err);
          } else {
            if(data.result.nModified == 0) {
              var writeError = new Error("Failed to add response!");
              writeError.status = 500;
              reject(writeError);
            }
            resolve(data);
          }
        }
      )
    });
  });
}

/***
  * Update a particular user's response to a question in the database.
  * @param userId: id of the userId
  * @param questionId: id of the questions that has been updated
  * @param action: user action to be added
  *
  */
function updateUserResponseByQuestionId(userId, questionId, responseId) {
  return getUserActionCollection()
  .then(function(collection) {
    return new Promise(function(resolve, reject) {
      collection.update(
        { id: userId, "actions.questionId": questionId},
        {
          $set: {
            "actions.$.responseId": responseId
          }
        },
        {
          upsert: true
        },
        function(err, data) {
          if(err) {
            reject(err);
          } else {
            if(data.result.nModified == 0
              && !data.result.hasOwnProperty('upserted')) {
              var writeError = new Error("Failed to update response!");
              writeError.status = 500;
              writeError.data = data;
              reject(writeError);
            }
            resolve(data);
          }
        }
      )
    });
  });
}

/***
  * Adds new user action to existing user
  * @param userId: id of the user for adding user action.
  * @param action: user action containing name of the scene & interaction type.
  *
  */
function addUserAction(userId, action) {
  return getUserActionCollection()
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
  });
}

/***
  * Adds a new user to the database and returns a UID for the user.
  *
  */
function addUserToDatabase () {
  return new Promise(function(resolve, reject) {
    getUserActionCollection()
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
function getUserActionCollection() {
  if(userActionCollection == null){
    userActionCollection = connection
    .then(getUserActions);
  }
  return userActionCollection;
}

module.exports = {
  addDummyUserData: addDummyData,
  addUserResponseByQuestionId: addUserResponseByQuestionId,
  updateUserResponseByQuestionId: updateUserResponseByQuestionId,
  addUserActionForUserId: addUserAction,
  getUserActionCollection: getUserActionCollection,
  addUserToDatabase: addUserToDatabase,
  getUserActionsByUserId: getUserActionsByUserId,
  createUserActionCollection: createUserActionCollection
}
