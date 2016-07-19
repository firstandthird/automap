'use strict';
const expect = require('chai').expect;
const autoMap = require('../');

describe('autoMap', () => {
  it('should be able to be called', (done) => {
    // an example of a list generator,
    // this one just generates a list of random objects:
    const listGenerator = (next) => {
      const theList = [];
      for (let i = 0; i < 10; i++) {
        theList.push({
          x: Math.round(Math.random() * 1000),
          y: Math.round(Math.random() * 1000),
          name: `object_${i}`
        });
      }
      next(null, theList);
    };
    autoMap(listGenerator, {
      multiply: (item, done) => {
        return done(item.x * item.y);
      },
      concat: (item, done) => {
        return done(`${item.x}${item.y}`);
      },
      both: ['concat', 'multiply', (item, results, done) => {
        return done(`multiply was ${results.multiply} and concat was ${results.concat}`);
      }]
    });
    // todo: add object-result combinator
    // todo: add final result handler
    done();
  });

  const listGeneratorWithError = (next) => {
    next("Pretend an error exists");
  };

});
