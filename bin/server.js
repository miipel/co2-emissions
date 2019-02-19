if(process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const http = require('http')
const app = require('../app')

const port = (process.env.PORT || '3001')
app.set('port', port)

const server = http.createServer(app)

const startServer = () =>
  new Promise(resolve => {
    server.listen(port, () => {
      console.log(`Server listening port ${port}`)
      resolve()
    })
  })
    .catch(err => {
      console.log(err)
      process.exit(1)
    })

module.exports = {
  startServer,
  app,
  server
}