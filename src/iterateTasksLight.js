var Promise = require('bluebird');
var fandlebars = require('fandlebars');
var Immutable = require('immutable');

var ResultDb = function () {
  var db = Immutable.Map();
  var keys = [];
  return {
    'get': function (key) {
      return db.get(key);
    },
    'set': function (key, value) {
      db = db.set(key, value);
      keys.push(key);
      return value;
    },
    'addStat': function (key, val) {
      // TODO keep track of stats
      var stat = db.get('_iterateTasksStats') || {};
      stat[key] = val;
      db = db.set('_iterateTasksStats', stat);
      return stat;
    },
    'report': function () {
      var report = db.toJS();
      var returnValue = keys.map(function (task) {
        return report[task];
      });
      Object.keys(report).forEach(function (key) {
        returnValue[key] = report[key];
      });
      return returnValue;
    }
  };
};

var applyParams = function (params, tasks, resultDb) {
  return params.map(function (param) {
    var returnValue = param;
    var key, resultObj;
    if (typeof param === 'string' && param.match(/^\{\{.+?\}\}$/g)) {
      resultObj = {};
      key = param.replace(/^\{\{(.+?)(\..+?)?\}\}$/g, '$1');
      resultObj[key] = resultDb.get(key);
      returnValue = fandlebars(param, resultObj, null, true)[param];
    }
    return returnValue;
  });
};

var reporter = function (verbose) {
  var fn = function () {};
  if (verbose) {
    fn = typeof verbose === 'function' ? verbose : console.log;
  }
  return function () {
    fn.apply(this, arguments);
  };
};

module.exports = function (list, taskName, verbose, errorArray) {
  var messages = new ResultDb();
  var report = reporter(verbose);
  return new Promise(function (resolve, reject) {
    var exec = function (sublist, msgList, callback) {
      // Keep all callbacks truly asynchronous (https://howtonode.org/understanding-process-next-tick)
      setImmediate(function () {
        var nextList = [];
        var params = Array.isArray(sublist[0].params) ? sublist[0].params : [sublist[0].params];
        params = applyParams(params, list, msgList);
        report('*** Executing "' + taskName + '" Task ***\n\t', sublist[0].name);

        var taskResObj = {};
        var task = applyParams([sublist[0].task], list, msgList)[0];
        try {
          var taskRes = task.apply(
            sublist[0].context,
            params
          );
          if (taskRes && taskRes.then && typeof taskRes.then === 'function' && taskRes.catch && typeof taskRes.catch === 'function') {
            // This is a bluebird function
            taskResObj = taskRes;
          } else {
            // it's an imposter!
            taskResObj.then = taskRes && taskRes.then || function (thenFn) {
              thenFn(taskRes);
              return taskResObj;
            };
            taskResObj.catch = taskRes && taskRes.catch || function (catchFn) {
              return taskResObj;
            };
          }
        } catch (e) {
          taskResObj.then = function (catchFn) {
            return taskResObj;
          };
          taskResObj.catch = function (catchFn) {
            e.message = '[' + sublist[0].name + '] ' + e.message;
            catchFn(e);
            return taskResObj;
          };
        }
        var start = new Date().getTime();
        taskResObj.then(function (msg) {
          var end = new Date().getTime();
          if (sublist[0].name && parseInt(sublist[0].name, 10).toString() !== sublist[0].name.toString()) {
            messages.set(sublist[0].name.toString(), msg);
            if (verbose) {
              messages.addStat(sublist[0].name.toString(), (end - start) + 'ms');
            }
          }
          nextList = sublist.slice(1);
          if (nextList.length > 0) {
            exec(nextList, messages, callback);
          } else {
            callback(null, messages.report());
          }
        })
          .catch(function (e) {
            callback(e);
          });
      });
    };

    if (list.length > 0) {
      // TODO: This can cause stack overflows, come up with a better way to run this
      // It might require some cool trickery with Promise.all on some functions
      exec(list, messages, function (e, r) {
        var resolveValue = {};
        if (e) {
          if (Array.isArray(e)) {
            resolveValue = errorArray ? e : (e[e.length - 1] || e);
          } else {
            resolveValue = e;
          }
          resolveValue.taskName = taskName;
          reject(resolveValue);
        } else {
          resolve(r);
        }
      });
    } else {
      process.nextTick(function () {
        resolve({});
      });
    }
  });
};
