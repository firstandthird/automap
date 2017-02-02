# automap
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
  concurrency, //optional
  // a function returning an async.autoInject param object for each character,
  // to process how much damage to incur
  // see (http://caolan.github.io/async/docs.html#.auto) for more)
  {
    // notice that the 'item' is passed here, so it is available in all
    // async.auto steps:
    isImmune(item, done) {
      if (item.immunities.indexOf(damageType) > -1){
        return done(null, true);
      }
      return done(null, false);
    },
    madeSavingThrow(done) {
      if (character.savingThrow > Math.random()) {
        return done(null, true);
      }
      return done(null, false);
    },
    newHitPoints(isImmune, madeSavingThrow, done) {
      if (!madeSavingThrow && !isImmune) {
        return done(null, character.hitPoints - Math.random() * 10);
      }
      return done();
    }],
    update(newHitPoints, done) {
      if (newHitPoints !== undefined) {
        character.hitPoints = newHitPoints;
      if (character.hitPoints < 0) {
        character.status = 'dead';
      }
      return character.update(done);
    }
    return done();
  },
  // the original character and the results of processing it are here,
  // return a value to map
  (character, results) => {
    const event = {
      type: 'attacked',
      character      
    };
    if (results.newHitPoints === undefined) {
      event.result = 'miss';
    } else if (results.newHitPoints > 0) {
      event.result = 'hit';
    } else {
      event.result = 'death';
    }
    return event;
  },
  (err, allEvents) => {
    // all characters are now done processing,
    // we have a list of events for each character:
    allEvents.forEach( (event) => {
      playEventAnimation(event);
    });
  });
});
```
