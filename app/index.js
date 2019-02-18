const express = require('express')
const logger = require('morgan')
const bodyParser = require('body-parser')
const routes = require('./routes')

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
logger.token('data', (req, res) => {
  return JSON.stringify(req.body)
})
app.use(
  logger(':method :url :data :status :res[content-length] - :response-time ms')
)

app.use('/api', routes)

app.use((req, res, next) => {
  const err = new Error('Not Found')
  err.status = 404
  next(err)
})

module.exports = app