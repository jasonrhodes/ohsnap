const app = require('../app')
const request = require('supertest')
const polaroid = require('../../polaroid')

describe('app example snapshot tests', function() {

  let snapshot

  before(function() {
    snapshot = polaroid(this, {
      howToFix: 'Snapshot failed, to fix re-run with AUTOFIX=true',
      autofix: Boolean(process.env.AUTOFIX)
    })
  })

  it('should get a collection of people', function() {
    return request(app).get('/example/people')
      .then(({ status, body }) => snapshot({ status, body }))
  })

  it('should get a person', function() {
    return request(app).get('/example/people/001')
      .then(({ status, body }) => snapshot({ status, body }))
  })

  it(`should 404 when it can't find a person`, function() {
    return request(app).get('/example/people/nope')
      .then(({ status, body }) => snapshot({ status, body }))
  })

  it(`should create a new person`, function() {
    return request(app).post('/example/people')
      .send({ name: 'Jo', age: 19 })
      .then(({ status, body }) => snapshot({ status, body }))
  })

  it(`should fail if wrong keys are used`, function() {
    return request(app).post('/example/people')
      .send({ name: 'Jo', weight: 150 })
      .then(({ status, body }) => snapshot({ status, body }))
  })

})
