const kue = require('kue')
const redis = require('redis')
const url = require('url')

kue.redis.createClient = () => {
  const { port, hostname, auth } = url.parse(process.env.REDIS_URL)
  const client = redis.createClient(port, hostname)
  if (auth) {
    client.auth(auth.split(':')[1])
  }
  return client
}

module.exports = kue.createQueue()
