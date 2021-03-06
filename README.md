# oh snap!

Declarative snapshot testing for your NodeJS APIs because it's cool and good to do this.

### But why?

So I really like Jest snapshot testing for React components, and after writing them for a while I realized it would be really useful for testing our HTTP API responses, too (express in our case). After all, API responses are big blocks of JSON alongside a status code and you want to be really sure those things never ever change. Snapshots are basically the ultimate API functional tests, in my opinion.

[blah blah blah jump to the example code](#example)

## Usage

There are two functions you'll use with this library: the default exported setup method (e.g. `ohsnap`), and the method it returns that you use in tests (e.g. `snap`).

### ohsnap()

First, call the `ohsnap` function with some setup options, usually in a test suite's `before` hook, to get a copy of a function you can use in your tests to compare snapshots. 

```javascript
const ohsnap = require('ohsnap')

describe('my test suite', function() {
  let snap
  
  before(function() {
    snap = ohsnap(options)
  }
```

It takes a single options hash with the following possible keys:

**app** (required)

Your API app object, which can be anything that [supertest](https://github.com/visionmedia/supertest#example) says it can be. (As of now, it says: "You may pass an http.Server, or a Function to request() - if the server is not already listening for connections then it is bound to an ephemeral port for you so there is no need to keep track of ports.")

**testFilePath** (required, if not using the mocha helper)

The full path to the current test file, which will be used to name the snap file if it doesn't already exist. i.e. `my-test.spec.js -> my-test.snap` Note: this needs to be the full path to the file, not just the file name.

\*The mocha helper takes care of this for you.

**getName** (optional)

Function that returns the name for a given snapshot. If you're not using mocha, you can figure out a different way to get that value or just skip this and pass in the snap names in each test directly.

\*The mocha helper takes care of this for you.

**snapsDirectory** (optional)

By default, snap files get placed in a `__snapshots__` directory next to the test file. If you want to override the _directory_ where those files are placed, list a full path to a different directory here (say you want them all to go in `/tests/snapshots` or something).

**logging** (optional, default: `true`)

Whether or not to log messages about snapshot statuses (when a new one is created or updated, how to fix broken ones, etc.)

**autofix** (optional, default `Boolean(process.env.AUTOFIX)`)

If true, broken snapshot tests will be rewritten and updated. You can figure out how you want the user to do this but by default it works by re-running the test suite with `AUTOFIX=true` prepended.

**howToFix** (optional)

Optional string that will be printed to the console (if logging is turned on) whenever a test fails, usually to tell the user how to autofix the snapshot.

### snap() 

_(or whatever you call the function returned by `ohsnap()`)_

Use the function returned by `ohsnap()` (we'll call it `snap`) to create snapshots inside of tests. You should return the result of this `snap` function if your test runner respects promises for async tests (if you need some kind of `done` function, uh, PRs welcome and stuff)

```javascript
it('should do some test things', function() {
  return snap({ method: 'GET', path: '/my/sweet/api' }) // tada
})
```

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

### ohsnap.mocha()

If you're using mocha as your test runner, setup like this:

```js
describe('some sweet tests', function() {
  let snap
  
  before(function() {
    snap = ohsnap.mocha(this, options)
  })
    
  // etc...
})
```

This will set up the snap directory, testFilePath, and the `getName` function (it uses the `it` description for each test), which is usually really useful/nice.

When you use the mocha helper, the only required field is the `app` itself.

### ohsnap.tap()

If you use tap or tape, the tap helper is your friend. You have to pass in the app and the testFilePath during setup, but it will give you a snap function that accepts the `t` reference as the first arg, then the other 2 regular args.

```js
const it = require('tape') // or: const tap = require('tap')
const app = require('../app')
const snap = require('../../ohsnap').tape({
  app,
  testFilePath: __filename
})

// if tap, use tap.test() here
it('should get a collection of people', function (t) {  
  return snap(t, {
    method: 'GET',
    path: '/example/people'
  }, { 
    name: 'should get a collection of people' 
  })
})
```

I recommend using [tap-difflet](https://github.com/namuol/tap-difflet) to output your snapshot results if you're using tape. 

## Examples

The full example is in the [example folder](/example) (right?), which you can run by cloning the repo and running:
```
npm install && npm run examples
```

The example is similar to this:

```javascript
const app = require('../app')
const ohsnap = require('ohsnap')

describe('example snapshot tests (with mocha)', function() {

  let snap

  before(function() {
    snap = ohsnap.mocha(this, {
      app
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

describe('some bdd tests without mocha', function() {
  
  let snap
  
  before(function() {
    snap = ohsnap({
      app,
      testFilePath: __filename
    })
  })
  
  it('should get a collection of people', function() {
    return snap({
      method: 'GET',
      path: '/example/people'
    }, {
      name: 'Get a collection of people' // used for the snapshot name
    })
  })
  
})

// tape or tap tests (basically the same)
const it = require('tape')
const app = require('../app')
const snap = require('../../ohsnap').tap({
  app,
  testFilePath: __filename
})

it('should get a collection of people', function (t) {  
  return snap(t, {
    method: 'GET',
    path: '/example/people'
  }, { 
    name: 'should get a collection of people' 
  })
})
```
