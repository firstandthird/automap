/* global describe, it */
'use strict';
const test = require('tape');
const autoMap = require('../');

test('should perform the automap process with a function as the first param', (t) => {
  // this is just a variable we'll use later to confirm the test:
  let totalToVerify = 0;
  // the first param is a function that generates the list you want to map to
  // this one just creates and returns a list of random objects,
  const listGenerator = (next) => {
    const theList = [];
    for (let i = 0; i < 10; i++) {
      theList.push({
        x: Math.round(Math.random() * 1000),
        y: Math.round(Math.random() * 1000),
        name: `object_${i}`
      });
    }
    theList.forEach((listItem) => {
      totalToVerify += listItem.x * listItem.y;
    });
    // first callback param is any error condition
    // second callback param is the list of objects to parse:
    next(null, theList);
  };
  // the second param is a function that generates the spec for async.auto,
  // (see http://caolan.github.io/async/docs.html#.auto for more)
  // notice that 'myTestItem' refers to the current item you are processing and
  // is available for use by the async.auto methods:
  const autoHandler = (myTestItem) => {
    return {
      multiply(done) {
        return done(null, myTestItem.x * myTestItem.y);
      },
      concat(done) {
        return done(null, `${myTestItem.x},${myTestItem.y}`);
      },
      both(concat, multiply, done) {
        t.equal(multiply, myTestItem.x * myTestItem.y);
        t.equal(concat, `${myTestItem.x},${myTestItem.y}`);
        return done(null, `multiply was ${multiply} and concat was ${concat}`);
      }
    };
  };

  // third param is a function that lets you merge the results together:
  const handleAutoResult = (currentItem, correspondingResultsForThatItem) => {
    t.equal(currentItem.x * currentItem.y, correspondingResultsForThatItem.multiply);
    t.equal(correspondingResultsForThatItem.concat, `${currentItem.x},${currentItem.y}`);
    return {
      name: currentItem.string,
      description: correspondingResultsForThatItem.both,
      value: correspondingResultsForThatItem.multiply
    };
  };

  // fourth param returns a list of all results:
  const reduceResults = (err, allItems) => {
    let total = 0;
    allItems.forEach((item) => {
      total += item.value;
    });
    // verify that it's correct:
    t.equal(total, totalToVerify);
    t.end();
  };
  // now, call automap and let it do the work:
  autoMap(listGenerator, autoHandler, handleAutoResult, reduceResults);
});

test('should perform the automap process with an array as the first param', (t) => {
  // this is just a variable we'll use later to confirm the test:
  let totalToVerify = 0;
  // the first param will just be an array this time, not a function:
  const theList = [];
  for (let i = 0; i < 10; i++) {
    theList.push({
      x: Math.round(Math.random() * 1000),
      y: Math.round(Math.random() * 1000),
      name: `object_${i}`
    });
  }
  theList.forEach((listItem) => {
    totalToVerify += listItem.x * listItem.y;
  });

  // the second param is a function that generates the spec for async.auto,
  // (see http://caolan.github.io/async/docs.html#.auto for more)
  const autoHandler = (myTestItem) => {
    // notice that 'myTestItem' refers to the current item you are processing and
    // is available for use by the async.auto methods:
    return {
      multiply(done) {
        return done(null, myTestItem.x * myTestItem.y);
      },
      concat(done) {
        return done(null, `${myTestItem.x},${myTestItem.y}`);
      },
      both(concat, multiply, done ) {
        t.equal(multiply, myTestItem.x * myTestItem.y);
        t.equal(concat, `${myTestItem.x},${myTestItem.y}`);
        return done(null, `multiply was ${multiply} and concat was ${concat}`);
      }
    };
  };

  // third param is a function that lets you merge the results together:
  const handleAutoResult = (currentItem, correspondingResultsForThatItem) => {
    t.equal(currentItem.x * currentItem.y, correspondingResultsForThatItem.multiply);
    t.equal(correspondingResultsForThatItem.concat, `${currentItem.x},${currentItem.y}`);
    return {
      name: currentItem.string,
      description: correspondingResultsForThatItem.both,
      value: correspondingResultsForThatItem.multiply
    };
  };

  // fourth param returns a list of all results:
  const reduceResults = (err, allItems) => {
    if (err) {
      throw err;
    }
    let total = 0;
    allItems.forEach((item) => {
      total += item.value;
    });
    // verify that it's correct:
    t.equal(total, totalToVerify);
    t.end();
    return total;
  };
  // now, call automap and let it do the work
  // notice that this time we're just handing it the list to work on:
  autoMap(theList, autoHandler, handleAutoResult, reduceResults);
});

test('optionally allow 2nd arg as object', (t) => {
  autoMap(['file1.txt', 'file2.txt'], {
    process(done) {
      return done(null, 'process');
    },
    write(process, done) {
      t.equal(process, 'process');
      return done(null, 'write');
    }
  }, (filename, results) => {
    t.equal(results.process, 'process');
    t.equal(results.write, 'write');
    return null;
  }, t.end);
});

test('injects "item" if not already included in the spec', (t) => {
  const matchedFiles = ['file1.txt', 'file2.txt'];
  let index = 0;
  autoMap(matchedFiles, {
    process(item, done) {
      t.equal(matchedFiles[index], item);
      index++;
      let found = false;
      Object.keys(matchedFiles).forEach((file) => {
        if (matchedFiles[file] === item) {
          found = true;
        }
      });
      t.equal(found, true);
      return done();
    },
    write(process, done) {
      done();
    }
  }, (filename, results) => {
    let found1 = false;
    let found2 = false;
    Object.keys(matchedFiles).forEach((file) => {
      if (matchedFiles[file] === results.item) {
        found1 = true;
      }
      if (matchedFiles[file] === filename) {
        found2 = true;
      }
    });
    t.equal(found1, true);
    t.equal(found2, true);
    return null;
  }, t.end);
});
