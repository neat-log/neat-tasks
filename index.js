var assert = require('assert')
var chalk = require('chalk')
var figures = require('figures')
var nanobus = require('nanobus')
var output = require('neat-log/output')
var neatSpinner = require('neat-spinner')
var once = require('once')

module.exports = runTasks

var spinner = neatSpinner('dots')

function runTasks (taskList, cb) {
  assert.ok(taskList, 'neat-tasks: taskList required')

  var doneTasks = []
  var totalCount = taskList.length

  return { view, use }

  function view (state) {
    var activeTask = state.activeTask
    return output(`
      ${doneView()}
      ${activeTask ? activeTask.render() : ''}
    `)

    function doneView () {
      if (!doneTasks.length) return ''
      return '\n' + doneTasks.map((task) => { return task }).join('\n')
    }
  }

  function use (state, bus) {
    state = Object.assign(state, {
      pass: 0,
      skipped: 0,
      fail: 0,
      totalCount: totalCount,
      count: taskList.length ? doneTasks.length + 1 : totalCount
    })

    runTask(taskList.shift())
    spinner.use(state, bus)

    function runTask (task) {
      var activeTask = Task(task)
      state.activeTask = activeTask
      state.count = taskList.length ? doneTasks.length + 1 : totalCount

      activeTask.bus.on('render', function () {
        bus.emit('render')
      })

      activeTask.run(taskDone)

      function taskDone (err) {
        if (err) state.fail++
        else if (activeTask.state.skipped) state.skipped++
        else state.pass++

        doneTasks.push(activeTask.render()) // save final render state
        activeTask.bus.removeAllListeners()
        state.activeTask = activeTask = null
        if (!taskList.length) return done()
        runTask(taskList.shift())
      }
    }

    function done () {
      state.done = true
      bus.render()
      if (cb) return cb()
      bus.emit('done')
    }
  }
}

function Task (opts) {
  if (!(this instanceof Task)) return new Task(opts)
  if (!opts) opts = {}
  var self = this

  self.title = opts.title
  self.view = opts.view
  self.task = opts.task
  self.bus = nanobus()
  self.state = {
    title: opts.title
  }
  self.skip = opts.skip || function (cb) { cb() }
}

Task.prototype.render = function () {
  var self = this
  var state = self.state

  return output(`
    ${title()}
    ${taskOutput()}
  `)

  function title () {
    return `${status(state.status)}${chalk.bold(state.title)}`

    function status (taskStatus) {
      if (state.status === 'pass') return chalk.greenBright(figures.tick) + ' '
      else if (state.status === 'fail') return chalk.redBright(figures.cross) + ' '
      else if (state.status === 'skipped') return chalk.yellowBright(figures.warning) + ' '
      return chalk.magentaBright(spinner.view()) + ' '
    }
  }

  function taskOutput () {
    if (state.done || state.skipped) {
      if (typeof state.done === 'string') {
        if (state.output) return state.output + '\n' + state.done
        else return '  ' + chalk.dim(state.done)
      }
      return state.output || ''
    } else if (self.view) return self.view(state)
    return ''
  }
}

Task.prototype.run = function (cb) {
  var self = this
  var state = Object.assign(self.state, {
    title: self.title,
    status: 'running',
    done: false,
    skipped: false
  })
  self.skip(function (skip) {
    if (!skip) return self.task(state, self.bus, once(done))
    self.bus.emit('render')
    state.status = 'skipped'
    state.skipped = true
    state.done = true
    if (typeof skip === 'string') state.title = skip
    cb()
  })

  function done (err) {
    self.bus.emit('render')
    if (!err) {
      state.status = 'pass'
      state.done = true
      return cb()
    }
    state.status = 'fail'
    state.done = err
    cb(err)
  }
}
