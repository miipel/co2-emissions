const fetch = require('node-fetch')
const streams = require('memory-streams')
const unzip = require('unzip')
const xml = require('xml-parse')
const fs = require('fs')
const baseUrl = 'http://api.worldbank.org/v2/en/indicator/SP.POP.TOTL?downloadformat=xml'


const { Transform } = require('stream')

const xmlParser = new Transform({
  readableObjectMode: true,

  transform(chunk, encoding, callback) {
    this.push(xml.parse(chunk))
    callback()
  }
})

try {
  fetch(baseUrl)
    .then(response => response.body)
    .then(body => {
      const stream = body
      stream
        .pipe(unzip.Parse())
        .pipe(xmlParser)
      const writer = new streams.WritableStream()
      stream.pipe(writer)
      stream.on('readable', function() {
        console.log(writer.toString())
      })
    })
} catch(error) {
  console.log(error)
}