# polaroid

A test snapshotting tool for API requests, based on Jest snapshot testing.

### Why?

I really really really like Jest snapshot testing for React components, and after writing them for a while I realized it would be really useful for testing API responses, too. After all, API responses are big blocks of JSON alongside a status code and you want to be really sure those things never ever change. These are basically the ultimate API functional tests, in my opinion.

### Current Name

This is probably a bad idea for obvious reasons so I will probably rename it.

## Usage

There are two functions you'll use with this library: the exported `polaroid` setup method, and the `snap` method used in tests.

### polaroid()

First, call the `polaroid` function with some setup options, usually in a test suite's `before` hook, to get a copy of the `snap` function you can use in your tests. It takes a single options hash with the following possible keys:

**app** (required)

Your API app object, which can be anything that [supertest](https://github.com/visionmedia/supertest#example) says it can be. (As of now, it says: "You may pass an http.Server, or a Function to request() - if the server is not already listening for connections then it is bound to an ephemeral port for you so there is no need to keep track of ports.")

**testFilePath** (required)

The full path to the current test file, which will be used to name the snap file if it doesn't already exist. i.e. `my-test.spec.js -> my-test.snap` Note: this needs to be the full path to the file, not just the file name.

**getName** (optional)

Function that returns the name for a given snapshot. The mocha helper sets this to the name of the current `it`, which works really well. If you're not using mocha, you can figure out a different way to get that value or just skip this and pass in the snap names in each test directly.

**snapsDirectory** (optional)

By default, snap files get placed in a `__snapshots__` directory next to the test file. If you want to override the _directory_ where those files are placed, list a full path to a different directory here (say you want them all to go in `/tests/snapshots` or something).

**logging** (optional, default: `true`)

Whether or not to log messages about snapshot statuses (when a new one is created or updated, how to fix broken ones, etc.)

**howToFix** (optional)

Optional string that will be printed to the console (if logging is turned on) whenever a test fails, usually to tell the user how to autofix the snapshot.

**autofix** (optiona, default `false`)

If true, broken snapshot tests will be rewritten and updated. You need to figure out how you want the user to do this -- in this example it's by re-running the test suite with `AUTOFIX=true` prepended.

### snap()

Use the `snap` function itself to create snapshots inside of tests. You should return the result of the `snap` function if your test runner respects promises for async tests (if you need some kind of `done` function, uh, PRs welcome and stuff)

The `snap` function takes 2 arguments: some http options and some snap options.

#### HTTP options

These get converted to supertest chained methods. Right now they include:

**method** (required)

HTTP method for the request (e.g. GET, PUT, POST, DELETE)

**path** (required)

The (ahem) path of the request  (e.g. /some/path)

**body**

Object representing the JSON body to be sent for PUT or POST requests.

#### Snap options

This argument is totally optional, as are all the keys inside this object:

**name**

If you didn't pass a `getName` function in earlier, or if you want to override it for some reason, you can pass the snap name here.

**message**

This is the message that `assert` will print if the snap didn't match the stored version. There's a default so this is probably not necessary.

## Example

```javascript
const app = require('../app')
const polaroid = require('polaroid')

describe('example snapshot tests', function() {

  let snap

  before(function() {
    // not necessary to use mocha, but if you do, this works
    const { testFilePath, getName } = polaroid.mocha(this)
    snap = polaroid({
      app,
      testFilePath,
      getName,
      howToFix: 'Snapshot failed, to fix re-run with AUTOFIX=true',
      autofix: Boolean(process.env.AUTOFIX)
    })
  })

  it('should get a collection of people', function() {
    return snap({
      method: 'GET',
      path: '/example/people'
    })
  })

  it(`should create a new person`, function() {
    return snap({
      method: 'POST',
      path: '/example/people',
      body: {
        name: 'Jo',
        age: 19
      }
    })
  })

})
```
