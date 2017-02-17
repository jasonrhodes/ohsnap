const assert = require('assert')
const fs = require('fs')
const path = require('path')

module.exports = (_mocha, options = {}) => {
  const { snapsDirectory, logging = true, autofix = false } = options
  const segments = _mocha.test.file.split(path.delimiter)
  const snapFile = segments.pop().replace(/(\.(spec|test))?\.js$/, '.snap')
  const dir = snapsDirectory || path.join(...segments, '__snapshots__')
  const snapFilePath = path.join(dir, snapFile)

  let snaps = {}

  function log(...args) {
    if (args.length === 0 || !options.logging) return
    console.log.apply(console, args)
  }

  try {
    snaps = fs.readFileSync(snapFilePath, 'utf8');
  } catch (err) {
    log(`\nCreating new snapshot file ${snapFilePath}\n`)
    writeSnaps(snaps, snapFilePath)
  }

  return (result, message = 'Result did not match stored snapshot.') => {
    const parsed = JSON.parse(result)
    const { title: name } = _mocha.test

    try {
      assert.deepEqual(parsed, snaps[name], message)
    } catch (err) {
      if (!snaps[name] || autofix) {
        snaps[name] = parsed
        log(`\nWriting snapshot for "${name}"`)
        return writeSnaps(snaps, snapFilePath)
      } else {
        log(options.howToFix)
        throw err
      }
    }
  }
}

function writeSnaps(snaps, path) {
  return fs.writeFileSync(path, JSON.stringify(snaps, null, 2))
}
