# autoMap
[![Build Status](https://travis-ci.org/firstandthird/autoMap.svg?branch=master)](https://travis-ci.org/firstandthird/autoMap)

Async.auto, but with a collection of objects. autoMap is useful when you need to asynchronously fetch an array of objects, apply some complex flowchart of events to each object, and then report back after every object is done processing.


## Example:
###Get every living character in a database, process the logic for how much damage they take, return when done:

```javascript
autoMap(
  // a function to get every living character in the databse:
  (next) => {
    entity.find({
      type: 'character',
      status: 'alive',
    }).toArray(next);
  },
  // a function returning an async.auto param object for each character,
  // to process how much damage to incur
  // see (http://caolan.github.io/async/docs.html#.auto) for more)
  (character) => {
    // notice that the 'character' is passed here, so it is available in all
    // async.auto steps:
    return {
      isImmune: (done) => {
        if (character.immunities.indexOf(damageType) > -1){
          return done(null, true);
        }
        return done(null, false);
      },
      madeSavingThrow: (done) => {
        if (character.savingThrow > Math.random()) {
          return done(null, true);
        }
        return done(null, false);
      },
      newHitPoints: ['isImmune', 'madeSavingThrow', (results, done) => {
        if (!results.madeSavingThrow && !results.isImmune) {
          return done(null, character.hitPoints - Math.random() * 10);
        }
        return done();
      }]
    }
  },
  // if needed, update each character:
  (character, results, done) => {
    if (results.newHitPoints !== undefined) {
      character.hitPoints = results.newHitPoints;
      if (character.hitPoints < 0) {
        character.status = 'dead';
      }
      return character.update(done);          
    }
    return done();
  },
  (err, allCharacters) => {
    // all characters are now done processing!
    return allCharacters;
  });
});
```
