#!/usr/bin/env node

const express = require('express')
const bodyParser = require('body-parser')
const queue = require('./queue')

const app = express()

app.use(
  bodyParser.raw({
    inflate: true,
    limit: '10kb',
    type: '*/*'
  })
)

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

  queue
    .create('fire', {
      date,
      method,
      url,
      headers,
      body
    })
    .delay(delay)
    .save()
  res.send('👌')
})

const port = process.env.PORT
app.listen(port, () => console.log(`The queue is listening at ${port}`))
