'use strict';
const async = require('async');
const _ = require('lodash');

// first param is a function that accepts a callback who's params are an error or the list to process
// second param is the spec for the async.auto flow to apply to each autoMethod in the list
// the third param is a callback function that combines the original listed item with the
// result of applying async.auto to that item
// fourth param takes in a
module.exports = (createListFunc, autoSpecObject, autoResultFunction, reduceResultsFunction) => {
  createListFunc((err, listToProcess) => {
    if (err) {
      throw err;
    }
    async.each(listToProcess, (currentItem, currentItemDone) => {
      const modifiedAutoSpecObject = _.clone(autoSpecObject);
      // wrap each function call in the autoSpecObject so that it takes in
      // the currentItem:
      const getWrapper = (functionToWrap) => {
        if (functionToWrap.length === 1) {
          // don't think we need to modify here
        } else if (functionToWrap.length === 2) {
          return (done) => {
            return functionToWrap(currentItem, done);
          };
        } else if (functionToWrap.length === 3) {
          return (results, done) => {
            return functionToWrap(currentItem, results, done);
          };
        }
      }
      _.each(modifiedAutoSpecObject, (autoMethod, autoDirective) => {
        if (_.isFunction(autoMethod)) {
          modifiedAutoSpecObject[autoDirective] = getWrapper(modifiedAutoSpecObject[autoDirective]);
        } else if (_.isArray(autoMethod)) {
          const functionIndex = autoMethod.length - 1;
          const originalFunc = autoMethod[functionIndex];
          console.log('---------------originalFunc:')
          console.log(originalFunc)
          console.log('========== from ')
          console.log(autoMethod)
          modifiedAutoSpecObject[autoDirective][functionIndex] = getWrapper(originalFunc);
        }
      });
      async.auto(modifiedAutoSpecObject, (err, anAutoResult) => {
        console.log(err);
        console.log(anAutoResult);
      });
    });
  });
};
