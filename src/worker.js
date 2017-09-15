const got = require('got')
const queue = require('./queue')

queue.process(({ id, data: { date, method, url, headers, body: bodyStr } }) => {
  console.log(`(${id}) Processing the request`)
  const body = new Buffer(bodyStr, 'binary')

  return got(url, { method, body, headers })
    .then(resp => console.log(`(${id}) The request is complete`))
    .catch(err =>
      console.error(`(${id}) The request is failed with an error: ${err}`)
    )
})

console.log('The worker is ready')
