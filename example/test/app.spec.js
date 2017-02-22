const app = require('../app')
const polaroid = require('../../polaroid')

describe('example snapshot tests', function() {

  let snap

  before(function() {
    const { testFilePath, getName } = polaroid.mocha(this)
    snap = polaroid({
      app,
      testFilePath,
      getName,
      howToFix: 'Snapshot failed, to fix re-run with AUTOFIX=true',
      autofix: Boolean(process.env.AUTOFIX)
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

  it(`should create a new person`, function() {
    return snap({
      method: 'POST',
      path: '/example/people',
      body: {
        name: 'Jo',
        age: 19
      }
    })
  })

  it(`should fail if wrong keys are used`, function() {
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
