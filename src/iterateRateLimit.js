var iterateTasksLight = require('./iterateTasksLight');
var Promise = require('bluebird');

var runAll = function (list) {
  return Promise.all(list).map(function (task) {
    console.log('task', task);
    return task.task.apply(this, task.params);
  });
};

module.exports = function (list, taskName, verbose, errorArray, chunkSize) {
  var tasks = [];
  list.forEach(function (task, i) {
    var idx = Math.floor(i / chunkSize);
    if (tasks.length <= idx) {
      tasks.push({
        'name': 'iterate rate limit: ' + i + '/' + Math.ceil(list.length / chunkSize),
        'task': runAll,
        'params': [
          []
        ]
      });
    }
    tasks[idx].params[0].push(task);
  });

  return iterateTasksLight(tasks, taskName, verbose, errorArray).then(function (arrays) {
    var returnArray = [];
    arrays.forEach(function (arr) {
      arr.forEach(function (val) {
        returnArray.push(val);
      });
    });
    return returnArray;
  });
};
