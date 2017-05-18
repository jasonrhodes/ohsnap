const tap = require('tap')
const app = require('../app')
const snap = require('../../ohsnap').tap({
  app,
  testFilePath: __filename
})

tap.test('should get a collection of people', function (t) {  
  return snap(t, {
    method: 'GET',
    path: '/example/people'
  }, { 
    name: 'should get a collection of people' 
  })
})