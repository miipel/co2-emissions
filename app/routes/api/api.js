const fetch = require('node-fetch')
const streams = require('memory-streams')
const unzip = require('unzip')
const parseString = require('xml2js').parseString
const router = require('express-promise-router')()

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
            parseString(writer,
              (err, result) => {
                const data = JSON.stringify(result['Root']['data'][0]['record'])
                const records = JSON.parse(data)
                const model = records.map(record => {
                  return {
                    key: record.field[0].$.key,
                    name: record.field[0]._,
                    year: record.field[2]._,
                    emissions: record.field[3]._
                  }
                })
                res.send(model)
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
              const data = JSON.stringify(result['Root']['data'][0]['record'])
              const records = JSON.parse(data)
              const model = records.map(record => {
                return {
                  key: record.field[0].$.key,
                  name: record.field[0]._,
                  year: record.field[2]._,
                  population: record.field[3]._
                }
              })
              res.send(model)
            })
          })
        })
    })
    .catch(error => {
      console.log(error)
    })
})

module.exports = router