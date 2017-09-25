const express = require('express')
const { format: formatURL, parse: parseURL } = require('url')
const bodyParser = require('body-parser')
const nanoid = require('nanoid')
const { omitBy } = require('lodash')
const queue = require('./queue')
const path = require('path')
const config = require('./config')

const app = express()

app.use(
  bodyParser.raw({
    inflate: true,
    limit: '10kb',
    type: '*/*'
  })
)

app.set('views', path.resolve(process.cwd(), 'src/views'))
app.set('view engine', 'ejs')

app.use(express.static(path.resolve(process.cwd(), 'src/public')))

app.use((req, res, next) => {
  if (req.get('Delay-Origin')) {
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

    console.log(`(${jobId}) Scheduling a request to ${date}`)
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
    next()
  }
})

app.get('/', (_, res) => {
  res.render('landing', { config })
})

app.all('/active', (_, res) => {
  queue.getDelayedCount().then(count => res.send(`Count: ${count}`))
})

app.all('/test', (_, res) => {
  res.send({})
})

app.delete('/requests/:jobId', (req, res) => {
  const { jobId } = req.params
  queue.getJob(jobId).then(job => {
    if (job) {
      job.remove().then(() => console.log(`(${jobId}) The request is deleted`))
    } else {
      // TODO: Send 404
    }
  })
})

const port = process.env.PORT
app.listen(port, () => console.log(`The queue is listening at ${port}`))
