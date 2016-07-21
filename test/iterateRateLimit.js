var iterateRateLimit = require('../src/iterateRateLimit');

var testMultiplier = (Math.random() * 10000000) + 600;

var testFn = function (val) {
  return val;
};

var val2text = function (val) {
  return Math.floor((val + 1) * testMultiplier).toString(34);
};

var testTasks = function (size) {
  var temp = [];
  for (var i = 0; i < size; i++) {
    temp.push({
      'name': 'Test ' + i,
      'task': testFn,
      'params': [val2text(i)]
    });
  }
  return temp;
};

var customTest = function (chunkSize) {
  return function (val) {
    return val.map(function (subVal, i) {
      return subVal === val2text(i);
    }).reduce(function (a, b) {
      return a && b;
    });
  };
};

module.exports = [{
  'name': 'Test 25 tasks, chunk of 5',
  'task': iterateRateLimit,
  'params': [testTasks(25), 'test 25/5', false, false, 5],
  'operator': 'custom',
  'customTest': customTest(5),
  'expected': true
}, {
  'name': 'Test 250 tasks, chunk of 17',
  'task': iterateRateLimit,
  'params': [testTasks(250), 'test 250/17', false, false, 17],
  'operator': 'custom',
  'customTest': customTest(17),
  'expected': true
}, {
  'name': 'Test 34514 tasks, chunk of 231',
  'task': iterateRateLimit,
  'params': [testTasks(34514), 'test 34514/231', false, false, 231],
  'operator': 'custom',
  'customTest': customTest(231),
  'expected': true
}];
