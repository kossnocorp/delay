#!/usr/bin/env node

const express = require('express')
const bodyParser = require('body-parser')
const queue = require('./queue')
const nanoid = require('nanoid')

const app = express()

app.use(
  bodyParser.raw({
    inflate: true,
    limit: '10kb',
    type: '*/*'
  })
)

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

app.all('/:url', (req, res) => {
  const { url } = req.params
  const { delay: dirtyDelay } = req.query

  let delay
  if (dirtyDelay) {
    delay = parseInt(dirtyDelay)
    if (Number.isNaN(delay)) {
      // TODO: Respond with error
      delay = undefined
    }
  }

  const date = new Date().toISOString()
  const method = req.method
  const headers = req.headers
  const body = req.body && req.body.toString('binary')
  const jobId = nanoid()

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
})

const port = process.env.PORT
app.listen(port, () => console.log(`The queue is listening at ${port}`))
