const assert = require('assert')
const makeRequest = require('./lib/makeRequest')
const { getSnapPath, getSnaps, writeSnaps } = require('./lib/snap-helpers')
const defaults = {
  testFilePath: false,
  getName: () => false,
  snapsDirectory: false,
  logging: true,
  autofix: false
}

module.exports = (options = {}) => {
  options = Object.assign({}, defaults, options)
  const { app, testFilePath, getName, snapsDirectory, logging, autofix } = options
  const snapFilePath = getSnapPath(testFilePath, snapsDirectory)
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
    const result = { status, body }

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
        log(options.howToFix)
        throw err
      }
    }
  })
}

module.exports.mocha = (_mocha) => ({
  testFilePath: _mocha.test.parent.file,
  getName: () => _mocha.test.title
})
