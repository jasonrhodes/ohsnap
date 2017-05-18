const assert = require('assert')
const querystring = require('querystring')
const makeRequest = require('./lib/makeRequest')
const { getSnapPath, getSnaps, writeSnaps } = require('./lib/snap-helpers')
const defaults = {
  testFilePath: false,
  getName: () => false,
  snapsDirectory: false,
  logging: true,
  includeRequest: false
}

function prepareOptions(options = {}) {
  const prepared = Object.assign({}, defaults, options)
  const { testFilePath, snapsDirectory } = prepared
  prepared.snapFilePath = getSnapPath(testFilePath, snapsDirectory)
  if (prepared.autofix === undefined) {
    prepared.autofix = Boolean(process.env.AUTOFIX)
    prepared.howToFix = 'Snapshot failed, to fix re-run with AUTOFIX=true';
  }
  return prepared
}

module.exports = (options = {}) => {
  const { app, snapFilePath, getName, logging, autofix, howToFix = null, includeRequest } = prepareOptions(options)
  let snaps = {}

  function log(...args) {
    if (args.length === 0 || !logging) { return }
    console.log(...args)
  }

  try {
    snaps = getSnaps(snapFilePath)
  } catch (err) {
    log(`\nCreating new snapshot file: ${snapFilePath}\n`)
    writeSnaps(snaps, snapFilePath)
  }

  return (request, { name = getName(), message = 'Result did not match stored snapshot.' } = {}) => makeRequest(app, request).then(({ status, body }) => {
    const response = { status, body }
    let result = response
    
    if (includeRequest) {
      let { path, query = false } = request
      let splitPath = path.split('?')
      const { method, body = false } = request
      
      if (splitPath.length > 1) {
        path = splitPath.shift()
        query = querystring.parse(splitPath.join('?'))
      }
      
      result = {
        request: { path, method, body, query },
        response
      }
      
      if (!body) {
        delete result.request.body
      }
      
      if (!query) {
        delete result.request.query
      }
      
    }

    if (!name) {
      throw new Error('No name provided for snapshot')
    }

    try {
      assert.deepEqual(result, snaps[name], message)
    } catch (err) {
      if (!snaps[name] || autofix) {
        snaps[name] = result
        log(`\nWriting snapshot for "${name}"`)
        writeSnaps(snaps, snapFilePath)
      } else {
        log(howToFix)
        err.expected = snaps[name]
        err.actual = result
        throw err
      }
    }
  })
}

module.exports.mocha = (_mocha, options = {}) => {
  const mochaOptions = {
    testFilePath: _mocha.test.parent.file,
    getName: () => _mocha.test.title
  }
  return module.exports(Object.assign(mochaOptions, options))
}

module.exports.tape = (options) => {
  const snap = module.exports(options)
  return (t, ...args) => {
    t.plan(1)
    return snap(...args)
      .then(() => t.pass('Snapshot matched'))
      .catch((err) => {
        if (err.actual && err.expected) {
          t.deepEqual(err.actual, err.expected)
        } else {
          throw err
        }
      })
  }
}
