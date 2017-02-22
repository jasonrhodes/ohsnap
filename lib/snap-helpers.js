const path = require('path')
const fs = require('fs')

module.exports.getSnapPath = function(testFilePath, snapsDirectory = false) {
  const segments = testFilePath.split(path.sep)
  const snapFile = segments.pop().replace(/(\.(spec|test))?\.js$/, '.snap')
  const snapDir = snapsDirectory || path.join(path.sep, ...segments, '__snapshots__')

  return path.join(snapDir, snapFile)
}

module.exports.getSnaps = function(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'))
}

module.exports.writeSnaps = function(snaps, filePath) {
  let result

  try {
    result = fs.writeFileSync(filePath, JSON.stringify(snaps, null, 2))
  } catch (err) {
    if (err.code === 'ENOENT') {
      fs.mkdirSync(path.dirname(filePath))
      return module.exports.writeSnaps(snaps, filePath)
    }
    throw err
  }

  return result
}
