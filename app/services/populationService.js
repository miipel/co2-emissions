const fetch = require('node-fetch')
const streams = require('memory-streams')
const unzip = require('unzip')
const baseUrl = 'http://api.worldbank.org/v2/en/indicator/SP.POP.TOTL?downloadformat=xml'

fetch(baseUrl)
  .then(response => response.body)
  .then(body => {
    const stream = body
    stream
      .pipe(unzip.Parse())
      .on('entry', entry => {
        const writer = new streams.WritableStream()
        entry.pipe(writer)
        entry.on('end', () => {
          console.log(writer.toString())
        })
      })
  })
  .catch(error => {
    console.log(error)
  })