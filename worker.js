#!/usr/bin/env node

const got = require('got')
const queue = require('./queue')

queue.process(job => {
  const { date, method, url, headers, body: bodyStr } = job.data
  const body = new Buffer(bodyStr, 'binary')
  return got(url, {
    method,
    body,
    headers
  })
    .then(resp => {
      console.log('Done:', resp.url)
    })
    .catch(err => {
      console.error(err)
      process.exit(1)
    })
})

console.log('The worker is ready')
