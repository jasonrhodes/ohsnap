const allowedKeys = ['name', 'age']

/**
 * Simple validation middleware to create an error case to test
 *
 */
module.exports = function validateKeys(req, res, next) {
  const keys = Object.keys(req.body)
  const valid = keys.length && keys.every((key) => allowedKeys.includes(key))

  if (!valid) {
    res.status(400).json({ message: `Must provide valid keys, allowed keys are ${allowedKeys.join(', ')}`})
    return
  }

  next()
}