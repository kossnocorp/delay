const test = require('ava')

test.before(t => {
  // TODO: Start the server and the worker
})

test.beforeEach(t => {
  // TODO: Clean up Redis
})

test.after.always(t => {
  // TODO: Shutdown the server and the worker
})

test.serial(t => t.fail())
