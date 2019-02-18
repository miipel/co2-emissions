const router = require('express-promise-router')()

router.use('/', require('./api/api'))

module.exports = router