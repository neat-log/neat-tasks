var neatLog = require('neat-log')
var output = require('neat-log/output')
var neatTasks = require('.')

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
    },
    skip: function (done) {
      done() // don't skip
    }
  },
  {
    title: 'Count to 3',
    task: function (state, bus, done) {
      // will be skipped
      done('FAIL - should be skipped')
    },
    skip: function (done) {
      done('We skipped this task')
    }
  },
  {
    title: 'Count to 3',
    task: function (state, bus, done) {
      state.count = 0
      var interval = setInterval(function () {
        if (state.count === 3) {
          // We errored!
          clearInterval(interval)
          return done('Error Occurred!!')
        }
        state.count++
        bus.emit('render')
      }, 1000)
    },
    view: function (state) {
      return `
        Count: ${state.count}
        Counting Things...
      `
    }
  }
]

var runTasks = neatTasks(tasks)
var neat = neatLog([header, runTasks.view, footer], {logspeed: 80})
neat.use(runTasks.use)
neat.use(function (state, bus) {
  bus.once('done', function () {
    process.exit(0)
  })
})

function header (state) {
  if (state.done) return 'Done with Neat Tasks!' + '\n'
  return output(`
    Running Neat Tasks: ${state.count} of ${state.totalCount}
  `) + '\n'
}

function footer (state) {
  if (!state.done) return ''
  return '\n' + output(`
    Completed All Tasks
      Pass: ${state.pass}
      Skipped: ${state.skipped}
      Fail: ${state.fail}
  `)
}
