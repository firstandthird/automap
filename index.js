'use strict';
const async = require('async');

// first param is a function that accepts a callback who's params are an error or the list to process
// second param is a spec or function that returns a spec for the async.auto flow to apply to each autoMethod in the list
// the third param is a callback function that combines the original listed item with the
// result of applying async.auto to that item
// fourth param is a callback that takes in all results:
module.exports = (createList, limit, createAutoSpec, mapAutoResult, done) => {
  if (typeof limit !== 'number') {
    done = mapAutoResult;
    mapAutoResult = createAutoSpec;
    createAutoSpec = limit;
    limit = null;
  }
  const callback = (err, listToProcess) => {
    if (err) {
      return done(err);
    }
    const items = listToProcess.map((value, index) => ({ index, value }));
    const params = [items];
    if (limit) {
      params.push(limit);
    }
    params.push((currentItem, currentItemDone) => {
      const spec = typeof createAutoSpec === 'function' ? createAutoSpec(currentItem.value) : createAutoSpec;
      // inject 'spec':
      spec.item = (specDone) => specDone(null, currentItem.value);
      spec.itemIndex = (specDone) => specDone(null, currentItem.index);
      spec.itemCount = (specDone) => specDone(null, listToProcess.length);
      async.autoInject(spec, (autoErr, anAutoResult) => {
        if (autoErr) {
          return done(autoErr);
        }
        currentItemDone(null, mapAutoResult(currentItem.value, anAutoResult));
      });
    }, done);
    const fn = (limit) ? async.mapLimit : async.map;
    fn.apply(null, params);
  };
  // if createList is a function:
  if (typeof createList === 'function') {
    return createList(callback);
  }
  // otherwise, assume createList is an array
  return callback(null, createList);
};
