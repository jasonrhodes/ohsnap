const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const allowedKeys = ['name', 'age']

module.exports = app

let db = []
let id = 1

// seed "db"
db.push({ id: getId(), name: 'Jess', age: 32 })
db.push({ id: getId(), name: 'Soso', age: 24 })
db.push({ id: getId(), name: 'Mawi', age: 40 })

// default content type to JSON if not specified
app.use((req, res, next) => {
  req.headers['content-type'] = 'application/json'
  next()
})

app.use(bodyParser.json())

app.get('/example/people', (req, res) => {
  res.status(200).json(db)
})

app.get('/example/people/:id', (req, res) => {
  const { id } = req.params
  const person = findPerson(id)
  if (person) {
    res.status(200).json(person)
  } else {
    res.status(404).json({ message: `Person with ID ${id} not found` })
  }
})

app.post('/example/people', validateKeys, (req, res) => {
  const person = req.body
  person.id = getId()
  db.push(person)

  res.status(201).json(person)
})

app.put('/example/people/:id', validateKeys, (req, res) => {
  const { id } = req.params
  const update = req.body

  delete update.id

  db = db.map((person) => {
    if (person.id === id) {
      return Object.assign({}, person, update)
    }
    return person
  })

  res.status(200).json(findPerson(id))
})

app.delete('/example/people/:id', (req, res) => {
  const { id } = req.params
  db = db.filter((person) => person.id !== id)

  res.sendStatus(204)
})

app.listen(6789) // necessary for supertest?

function findPerson(id) {
  return db.find((person) => person.id === id)
}

function getId() {
  return `00${id++}`
}

function validateKeys(req, res, next) {
  const keys = Object.keys(req.body)
  const valid = keys.length && keys.every((key) => allowedKeys.includes(key))

  if (!valid) {
    res.status(400).json({ message: `Must provide valid keys, allowed keys are ${allowedKeys.join(', ')}`})
    return
  }

  next()
}
