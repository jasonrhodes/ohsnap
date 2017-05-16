class People {
  constructor() {
    this.db = [];
    this.id = 1;
  }
  
  insert(person) {
    person.id = this.getID()
    this.db.push(person)
    return person
  }
  
  batchInsert(people) {
    return people.map((person) => this.insert(person))
  }
  
  update(id, update) {
    delete update.id

    this.db = this.db.map((person) => {
      if (person.id === id) {
        return Object.assign({}, person, update)
      }
      return person
    })
  }
  
  delete(id) {
    this.db = this.db.filter((person) => person.id !== id)
  }
  
  findOne(id) {
    return this.db.find((person) => person.id === id)
  }
  
  list() {
    return this.db
  }
  
  getID() {
    return `00${this.id++}`
  }
}

module.exports = People