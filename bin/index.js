const { startServer } = require('./server')
startServer()
  .then(() => console.log('Server running'))