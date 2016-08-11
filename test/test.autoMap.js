'use strict';
const expect = require('chai').expect;
const autoMap = require('../');

describe('autoMap', () => {
  it('should perform the automap process with a function as the first param', (allDone) => {
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
    const autoHandler = (myTestItem) => {
      // notice that 'myTestItem' refers to the current item you are processing and
      // is available for use by the async.auto methods:
      return {
        multiply: (done) => {
          return done(null, myTestItem.x * myTestItem.y);
        },
        concat: (done) => {
          return done(null, `${myTestItem.x},${myTestItem.y}`);
        },
        both: ['concat', 'multiply', (results, done) => {
          expect(results.multiply).to.equal(myTestItem.x * myTestItem.y);
          expect(results.concat).to.equal(`${myTestItem.x},${myTestItem.y}`);
          return done(null, `multiply was ${results.multiply} and concat was ${results.concat}`);
        }]
      };
    };

    // third param is a function that lets you merge the results together:
    const handleAutoResult = (currentItem, correspondingResultsForThatItem) => {
      expect(currentItem.x * currentItem.y).to.equal(correspondingResultsForThatItem.multiply);
      expect(correspondingResultsForThatItem.concat).to.equal(`${currentItem.x},${currentItem.y}`);
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
      expect(total).to.equal(totalToVerify);
      return total;
    };
    // now, call automap and let it do the work:
    autoMap(listGenerator, autoHandler, handleAutoResult, reduceResults);
    allDone();
  });
  it('should perform the automap process with an array as the first param', (allDone) => {
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
        multiply: (done) => {
          return done(null, myTestItem.x * myTestItem.y);
        },
        concat: (done) => {
          return done(null, `${myTestItem.x},${myTestItem.y}`);
        },
        both: ['concat', 'multiply', (results, done) => {
          expect(results.multiply).to.equal(myTestItem.x * myTestItem.y);
          expect(results.concat).to.equal(`${myTestItem.x},${myTestItem.y}`);
          return done(null, `multiply was ${results.multiply} and concat was ${results.concat}`);
        }]
      };
    };

    // third param is a function that lets you merge the results together:
    const handleAutoResult = (currentItem, correspondingResultsForThatItem) => {
      expect(currentItem.x * currentItem.y).to.equal(correspondingResultsForThatItem.multiply);
      expect(correspondingResultsForThatItem.concat).to.equal(`${currentItem.x},${currentItem.y}`);
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
      expect(total).to.equal(totalToVerify);
      return total;
    };
    // now, call automap and let it do the work
    // notice that this time we're just handing it the list to work on:
    autoMap(theList, autoHandler, handleAutoResult, reduceResults);
    allDone();
  });
});
