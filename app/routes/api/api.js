const fetch = require('node-fetch')
const streams = require('memory-streams')
const unzip = require('unzip')
const parseString = require('xml2js').parseString
const router = require('express-promise-router')({ mergeParams: true })

const emissionsUrl = 'http://api.worldbank.org/v2/en/indicator/EN.ATM.CO2E.KT?downloadformat=xml'
const populationUrl = 'http://api.worldbank.org/v2/en/indicator/SP.POP.TOTL?downloadformat=xml'


router.get('/emissions', (req, res) => {
  fetch(emissionsUrl)
    .then(response => response.body)
    .then(body => {
      const stream = body
      stream
        .pipe(unzip.Parse())
        .on('entry', entry => {
          const writer = new streams.WritableStream()
          entry.pipe(writer)
          entry.on('end', () => {
            parseString(writer.toString(), (err, result) => {
              const data = JSON.stringify(result)
              res.send(JSON.parse(data))
            })
          })
        })
    })
    .catch(error => {
      console.log(error)
    })
})

router.get('/population', (req, res) => {
  fetch(populationUrl)
    .then(response => response.body)
    .then(body => {
      const stream = body
      stream
        .pipe(unzip.Parse())
        .on('entry', entry => {
          const writer = new streams.WritableStream()
          entry.pipe(writer)
          entry.on('end', () => {
            parseString(writer.toString(), (err, result) => {
              const data = JSON.stringify(result)
              res.send(JSON.parse(data))
            })
          })
        })
    })
    .catch(error => {
      console.log(error)
    })
})

module.exports = router