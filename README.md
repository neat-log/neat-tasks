# neat-tasks

terminal task list for neat-log

[![npm][npm-image]][npm-url]
[![travis][travis-image]][travis-url]
[![standard][standard-image]][standard-url]

[npm-image]: https://img.shields.io/npm/v/neat-tasks.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/neat-tasks
[travis-image]: https://img.shields.io/travis/joehand/neat-tasks.svg?style=flat-square
[travis-url]: https://travis-ci.org/joehand/neat-tasks
[standard-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square
[standard-url]: http://npm.im/standard

## Install

```
npm install neat-tasks
```

## Usage

See `example.js`

```js
var neatTasks = require('neat-tasks')
var neatLog = require('neat-log')
var output = require('neat-log/output')

var neatLog = require('neat-log')
var output = require('neat-log/output')
var neatTasks = require('neat-tasks')

var tasks = [
  {
    title: 'Count Down from 4',
    task: function (state, bus, done) {
      state.count = 3
      var interval = setInterval(function () {
        if (state.count === 0) {
          state.title = 'Lift Off!'
          clearInterval(interval)
          return done(null)
        }
        state.title = `${state.count} seconds remain`
        state.count--
        bus.emit('render')
      }, 1000)
    }
  }
]

var runTasks = neatTasks(tasks)
var neat = neatLog(runTasks.view)
neat.use(runTasks.use)
```


## License

[MIT](LICENSE.md)
