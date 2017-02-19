const assert = require('assert')
const fs = require('fs')
const path = require('path')
const defaults = {
  logging: true,
  autofix: false
}

module.exports = (_mocha, options = defaults) => {
  const { snapsDirectory, logging = true, autofix = false } = options
  const segments = _mocha.test.parent.file.split(path.sep)
  const snapFile = segments.pop().replace(/(\.(spec|test))?\.js$/, '.snap')
  const dir = snapsDirectory || path.join(path.sep, ...segments, '__snapshots__')
  const snapFilePath = path.join(dir, snapFile)
  let snaps = {}

  function log(...args) {
    if (args.length === 0 || !logging) { return }
    console.log(...args)
  }

  try {
    snaps = JSON.parse(fs.readFileSync(snapFilePath, 'utf8'));
  } catch (err) {
    log(`\nCreating new snapshot file ${snapFilePath}\n`)
    writeSnaps(snaps, snapFilePath)
  }

  return (result, message = 'Result did not match stored snapshot.') => {
    const { title: name } = _mocha.test
    let parsed = result

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

function writeSnaps(snaps, filePath) {
  let result

  try {
    result = fs.writeFileSync(filePath, JSON.stringify(snaps, null, 2))
  } catch (err) {
    if (err.code === 'ENOENT') {
      fs.mkdirSync(path.dirname(filePath))
      return writeSnaps(snaps, filePath)
    }
    throw err
  }

  return result
}
