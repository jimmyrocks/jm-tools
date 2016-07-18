var createWhereClause = require('../src/createWhereClause');
var fandlebars = require('fandlebars');

// Test from: http://docs.sequelizejs.com/en/latest/docs/querying/
var tests = [{
  'param': {
    'authorId': 2
  },
  'result': '("authorId" = \'2\')'
}, {
  'param': {
    'authorId': 2,
    'status': 'active'
  },
  'result': '("authorId" = \'2\' AND "status" = \'active\')'
}, {
  'param': {
    'deletedAt': {
      '$ne': null
    }
  },
  'result': '("deletedAt" IS NOT \'null\')'
}, {
  'param': {
    rank: {
      $or: {
        $lt: 1000,
        $eq: null
      }
    }
  },
  result: '(("rank" < \'1000\' OR "rank" IS \'null\'))'
}, {
  'param': {
    createdAt: {
      $lt: new Date('2016-07-18T20:01:23.812Z').toISOString(),
      $gt: new Date(new Date('2016-07-18T20:01:23.812Z') - 24 * 60 * 60 * 1000).toISOString()
    }
  },
  result: '("createdAt" < \'2016-07-18T20:01:23.812Z\' AND "createdAt" > \'2016-07-17T20:01:23.812Z\')'
}, {
  'param': {
    $or: [{
      title: {
        $like: 'Boat%'
      }
    }, {
      description: {
        $like: '%boat%'
      }
    }]
  },
  'result': '(("title" LIKE \'Boat%\' OR "description" LIKE \'%boat%\'))'
}, {
  'param': {
    '$or': [{
      'key': {
        '$ne': 1
      }
    }, {
      'key': {
        '$ne': 2
      }
    }]
  },
  'result': '(("key" != \'1\' OR "key" != \'2\'))'
}, {
  'param': {
    '$and': [{
      'key': {
        '$ne': 1
      }
    }, {
      'key': {
        '$ne': 2
      }
    }]
  },
  'result': '(("key" != \'1\' AND "key" != \'2\'))'
}, {
  'param': {
    status: 'A',
    age: {
      $lt: 30
    }
  },
  'result': '("status" = \'A\' AND "age" < \'30\')'
}, {
  'param': {
    status: {
      $in: ['P', 'D']
    }
  },
  'result': '("status" IN (\'P\', \'D\'))'
}, {
  'param': {
    status: {
      $nin: ['P', 'D']
    }
  },
  'result': '("status" NOT IN (\'P\', \'D\'))'
}];

var customTest = function (res) {
  return fandlebars(res[0], res[1], function (v) {
    return "'" + v + "'";
  });
};

module.exports = tests.map(function (test, i) {
  return {
    'name': 'test #' + (i + 1),
    'task': createWhereClause,
    'params': [test.param],
    'operator': 'custom',
    'customTest': customTest,
    'expected': test.result
  };
});
