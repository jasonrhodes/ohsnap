const app = require('../app')
const ohsnap = require('../../ohsnap')

describe('example snapshot tests', function() {

  let snap

  before(function() {
    snap = ohsnap.mocha(this, { 
      app,
      includeRequest: Boolean(process.env.INCLUDE_REQUEST)
    })
  })

  it('should get a collection of people', function() {
    return snap({
      method: 'GET',
      path: '/example/people'
    })
  })

  it('should get a person', function() {
    return snap({
      method: 'GET',
      path: '/example/people/001'
    })
  })

  it(`should error when it can't find a person`, function() {
    return snap({
      method: 'GET',
      path: '/example/people/nope'
    })
  })

  it('should create a new person', function() {
    return snap({
      method: 'POST',
      path: '/example/people',
      body: {
        name: 'Jo',
        age: 19
      }
    })
  })

  it('should fail if wrong keys are used', function() {
    return snap({
      method: 'POST',
      path: '/example/people',
      body: {
        name: 'Jo',
        weight: 150
      }
    })
  })

})
