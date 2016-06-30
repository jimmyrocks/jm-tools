var iterateTasks = require('../src/iterateTasks');
var iterateTasksLight = require('../src/iterateTasksLight');

var testTask = function (a, b) {
  return a + b;
};

var test = function (light, taskCount, prevTime) {
  var fn = light ? iterateTasksLight : iterateTasks;

  var tasks = [];
  for (var i = 0; i < taskCount; i++) {
    tasks.push({
      'name': 'test ' + i,
      'description': 'The ' + i + 'th iteration of the test',
      'task': testTask,
      'params': [(i > 0 ? '{{test ' + (i - 1) + '}}' : 0), 1]
    });
  }

  var start = new Date().getTime();
  return fn(tasks, 'test tasks', false).then(function (r) {
    var end = new Date().getTime();
    console.log(r);
    console.log('completed', end - start);
    return [end - start, prevTime ? prevTime < (end - start) : true];
  });
};

var customTest = function (res) {
  return res[1];
};

module.exports = [{
  'name': 'lightTest500',
  'task': test,
  'params': [true, 500],
  'operator': 'custom',
  'customTest': customTest,
  'expected': true
}, {
  'name': 'normalTest500',
  'task': test,
  'params': [false, 500, '{{lightTest500.0}}'],
  'operator': 'custom',
  'customTest': customTest,
  'expected': true
}, {
  'name': 'lightTest1000',
  'task': test,
  'params': [true, 1000],
  'operator': 'custom',
  'customTest': customTest,
  'expected': true
}, {
  'name': 'normalTest1000',
  'task': test,
  'params': [false, 1000, '{{lightTest1000.0}}'],
  'operator': 'custom',
  'customTest': customTest,
  'expected': true
}, {
  'name': 'lightTest10000',
  'task': test,
  'params': [true, 10000],
  'operator': 'custom',
  'customTest': customTest,
  'expected': true
}, {
  'name': 'normalTest10000',
  'task': test,
  'params': [false, 10000, '{{lightTest10000.0}}'],
  'operator': 'custom',
  'customTest': customTest,
  'expected': true
}];
