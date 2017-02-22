const supertest = require('supertest')

module.exports = (app, { method, path, body = false }) => {
  let request = supertest(app)[method.toLowerCase()](path)

  if (body) {
    request = request.send(body)
  }

  return request
}
