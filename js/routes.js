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
exports.getRelationshipsData = function(req, res) {
  characterDataModel.getCharacterCollection()
  .then(function(data){
    res.send(data);
  })
  .catch(console.error.bind(this));
}

/***
  * Fetch characters
  *
  */
exports.getCharactersData = function(req, res) {
  characterDataModel.getCharacterCollection()
  .then(function(collection){
    collection.find({})
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
  * Fetch character by name
  *
  */
exports.getCharacterByName = function(req, res) {
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
exports.getCharacterById = function(req, res) {
  characterDataModel.getCharacterById(parseInt(req.query.id))
  .then(function(characters) {
    res.send(characters);
  })
  .catch(function(e) {
    res.send(e);
  });
}

// TODO:XXX refactor, it looks like it can be better
exports.getCharacterRelationships = function(req, res) {
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
exports.createUser = function(req, res) {
  userActionsModel.addUserToDatabase()
  .then(function(response) {
    res.send(JSON.stringify(response));
  })
  .catch(console.error.bind(this));
}

/**
 * fetch item for an episode
 *
 */
exports.fetchItemForEpisode = function(req, res) {
  promisifiedReadFile('./data/items.json')
  .then(function(data) {
    return data.filter(function(item){
      return item.episodeId == req.data.episodeId;
    })
  })
  .then(function(items) {
    var itemIdx = Math.random() * (2 - 0) + 0;
    res.send(JSON.stringify(items[itemIdx]));
  })
  .catch(console.error.bind(this));
}

/***
  * Post comments for an item
  *
  */
exports.postCommentForItemId = function(req, res) {
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
exports.postCommentForItemId2 = function(req, res) {
  var comment = {
    sceneName: req.body.sceneName,
    interactionType: req.body.interactionType
  }
  userActionsModel.addCommentForUserId(req.body.userId, req.body.itemId, userAction);
  res.send("Comment posted");
}

/***
  * Add user action to the user in the database
  *
  */
exports.getRelationshipsData = function(req, res) {
  characterDataModel
  .fetchRelationshipsForCharacter(req.body.characterId, req.body.relDegree);
  res.send("Comment posted");
}

exports.createCharacterCollection = function(req, res) {
  characterDataModel.createCharacterCollection();
  res.send("collection made");
}

exports.addDummyData = function(req, res) {
  characterDataModel.addDummyData();
  res.send("dummy data added!")
}
