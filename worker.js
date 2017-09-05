#!/usr/bin/env node

const got = require('got')
const queue = require('./queue')

queue.process(job => {
  const { date, method, url, headers, body: bodyStr } = job.data
  console.log(`Processing a request scheduled at ${date}`)
  const body = new Buffer(bodyStr, 'binary')
  return got(url, {
    method,
    body,
    headers
  })
    .then(resp => {
      console.log(`The request to ${url} scheduled at ${date} is complete`)
    })
    .catch(err => {
      console.error(
        `The request to ${url} scheduled at ${date} failed with erorr:`
      )
      console.error(err)
    })
})

console.log('The worker is ready')
