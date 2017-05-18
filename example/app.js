const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const validateKeys = require('./lib/validate-keys')
const PeopleModel = require('./lib/people')
const people = new PeopleModel()

module.exports = app

// seed people "db"
people.batchInsert([
  { name: 'Jess', age: 32 },
  { name: 'Soso', age: 19 },
  { name: 'Mawi', age: 57 }
])

// default content type to JSON if not specified
app.use((req, res, next) => {
  if (!req.headers['content-type']) {
    req.headers['content-type'] = 'application/json'
  }
  next()
})

app.use(bodyParser.json())

app.get('/example/people', (req, res) => {
  res.status(200).json(people.list())
})

app.get('/example/people/:id', (req, res) => {
  const { id } = req.params
  const person = people.findOne(id)
  if (person) {
    res.status(200).json(person)
  } else {
    res.status(404).json({ message: `Person with ID ${id} not found` })
  }
})

app.post('/example/people', validateKeys, (req, res) => {
  const person = req.body
  people.insert(person)
  res.status(201).json(person)
})

app.put('/example/people/:id', validateKeys, (req, res) => {
  const { id } = req.params
  const update = req.body
  people.update(id, update)
  res.status(200).json(people.findOne(id))
})

app.delete('/example/people/:id', (req, res) => {
  const { id } = req.params
  people.delete(id)
  res.sendStatus(204)
})

if (require.main === module) {
  app.listen(6789)
}
