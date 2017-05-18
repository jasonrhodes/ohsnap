const it = require('tape')
const app = require('../app')
const snap = require('../../ohsnap').tape({
  app,
  testFilePath: __filename
})

it('should get a collection of people', function (t) {  
  return snap(t, {
    method: 'GET',
    path: '/example/people'
  }, { 
    name: 'should get a collection of people' 
  })
})