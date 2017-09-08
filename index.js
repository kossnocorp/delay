#!/usr/bin/env node

const express = require('express')
const { format: formatURL, parse: parseURL } = require('url')
const bodyParser = require('body-parser')
const nanoid = require('nanoid')
const { omitBy } = require('lodash')
const queue = require('./queue')

const app = express()

app.use(
  bodyParser.raw({
    inflate: true,
    limit: '10kb',
    type: '*/*'
  })
)

app.use((req, res, next) => {
  console.log(
    'Got a request with the given headers:',
    JSON.stringify(req.headers)
  )

  if (req.get('Delay-Origin')) {
    console.log('The request is a schedule request')

    const { protocol, host } = parseURL(req.get('Delay-Origin'))
    const url = formatURL(
      Object.assign({}, parseURL(req.originalUrl), { protocol, host })
    )

    const delay = parseInt(req.get('Delay-Value'))
    if (Number.isNaN(delay)) {
      // TODO: Respond with error
    }

    const date = new Date().toISOString()
    const method = req.method
    const headers = Object.assign(
      omitBy(req.headers, (v, k) => k.match(/^delay-/i)),
      {
        host
      }
    )
    const body = req.body && req.body.toString('binary')
    const jobId = nanoid()

    console.log(`Scheduling a request to ${url} (#${jobId})`)
    queue
      .add(
        {
          date,
          method,
          url,
          headers,
          body
        },
        { delay, jobId }
      )
      .then(() => {
        res.send(JSON.stringify(jobId))
      })
  } else {
    console.log('Proceeding to routes')
    next()
  }
})

app.all('/active', (_, res) => {
  queue.getDelayedCount().then(count => res.send(`Count: ${count}`))
})

app.all('/test', (_, res) => {
  res.send('👌')
})

app.delete('/jobs/:jobId', (req, res) => {
  const { jobId } = req.params
  console.log('Job ID:', jobId)
  queue.getJob(jobId).then(job => {
    if (job) {
      job.remove()
    } else {
      // TODO: Send 404
    }
    res.send('👌')
  })
})

const port = process.env.PORT
app.listen(port, () => console.log(`The queue is listening at ${port}`))
