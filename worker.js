#!/usr/bin/env node

const got = require('got')
const queue = require('./queue')

queue.process('fire', (job, done) => {
  console.log('Processing job...')
  const { date, method, url, headers, body: bodyStr } = job.data
  const body = new Buffer(bodyStr, 'binary')
  got(url, {
    method,
    body,
    headers
  })
  done()
})

console.log('The worker is ready')
