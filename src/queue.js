const Queue = require('bull')

module.exports = new Queue('requests', process.env.REDIS_URL)
