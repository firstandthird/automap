'use strict';
const async = require('async');

// first param is a function that accepts a callback who's params are an error or the list to process
// second param is a function that returns a spec for the async.auto flow to apply to each autoMethod in the list
// the third param is a callback function that combines the original listed item with the
// result of applying async.auto to that item
// fourth param takes in all results and processes all of them:
module.exports = (createList, createAutoSpec, handleAutoResult, reduceResults) => {
  createList((err, listToProcess) => {
    if (err) {
      throw err;
    }
    const newResults = [];
    async.each(listToProcess, (currentItem, currentItemDone) => {
      async.auto(createAutoSpec(currentItem), (autoErr, anAutoResult) => {
        if (autoErr) {
          throw autoErr;
        }
        handleAutoResult(currentItem, anAutoResult, (handleAutoResultErr, handleAutoResultOutcome) => {
          newResults.push(handleAutoResultOutcome);
          currentItemDone();
        });
      });
    }, (eachErr) => {
      reduceResults(eachErr, newResults);
    });
  });
};
