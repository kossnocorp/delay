#!/usr/bin/env node

const Koa = require('koa')
const app = new Koa()

app.use(async ctx => {
  ctx.body = 'OK'
})

const port = process.env.PORT
console.log(`Listening at ${port}`)
app.listen(port)
