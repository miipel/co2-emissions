const fetch = require('node-fetch')
const streams = require('memory-streams')
const unzip = require('unzip')
const parseString = require('xml2js').parseString
const router = require('express-promise-router')()

const emissionsUrl = 'http://api.worldbank.org/v2/en/indicator/EN.ATM.CO2E.KT?downloadformat=xml'
const populationsUrl = 'http://api.worldbank.org/v2/en/indicator/SP.POP.TOTL?downloadformat=xml'

const emissionsModel = (record) => {
  return {
    key: record.field[0].$.key,
    location: record.field[0]._,
    year: record.field[2]._,
    emissions: record.field[3]._
  }
}

const populationsModel = (record) => {
  return {
    key: record.field[0].$.key,
    location: record.field[0]._,
    year: record.field[2]._,
    population: record.field[3]._
  }
}


const getData = (url, model) => new Promise((resolve, reject) => {
  return fetch(url)
    .then(({ body: stream }) => {
      stream
        .pipe(unzip.Parse())
        .on('entry', entry => {
          const writer = new streams.WritableStream()
          entry.pipe(writer)
          entry.on('end', () => {
            parseString(writer,
              (err, result) => {
                const records = result['Root']['data'][0]['record']
                resolve(records.map(model))
              })
          })
        })
    })
    .catch(error => {
      console.log(error)
    })
})

router.get('/emissions', (req, res) => {
  getData(emissionsUrl, emissionsModel).then(emissions => res.send(emissions))
})

router.get('/population', (req, res) => {
  getData(populationsUrl, populationsModel).then(populations => res.send(populations))
})

// Based on the data, only possible unique key is areakey+year
// This operation can take 3 minutes to complete
// const combineData = (array1, array2) => {
//   const combined = [...array1, ...array2].reduce((accumulator, value) => ({
//     ...accumulator,
//     [value.key + value.year]: accumulator[value.key + value.year]
//       ? { ...accumulator[value.key + value.year], ...value }
//       : value
//   }), {})
//   Object.values(combined)
// }

const combineData = (emissions, populations) => {
  const combined = {}
  emissions.forEach(record => {
    if(combined[record.key] === undefined) {
      combined[record.key] = {}
    }
    combined[record.key].location = record.location
    if(combined[record.key].years === undefined) {
      combined[record.key].years = {}
    }
    combined[record.key].years[record.year] = {}
    if(combined[record.key].years[record.year].emissions === undefined) {
      combined[record.key].years[record.year].emissions = {}
    }
    combined[record.key].years[record.year].emissions = record.emissions
  })
  populations.forEach(record => {
    if(combined[record.key].years[record.year].population === undefined) {
      combined[record.key].years[record.year].population = {}
    }
    combined[record.key].years[record.year].population = record.population
  })
  return combined
}

router.get('/data', (req, res) => {
  Promise.all([getData(emissionsUrl, emissionsModel), getData(populationsUrl, populationsModel)])
    .then(([emissions, populations]) => {
      const data = combineData(emissions, populations)
      res.send(data)
    })
})

module.exports = router