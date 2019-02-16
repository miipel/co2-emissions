const request = require('request-promise-native')
const os = require('os')
const fs = require('fs-extra')
const baseUrl = 'http://api.worldbank.org/v2/en/indicator/EN.ATM.CO2E.KT?downloadformat=xml'

const response = request.get(baseUrl, {
  zip: true,
  resolveWithFullResponse: true,
  encoding: null
})

const tmpPath = `${os.tmpdir()}/${new Date().getTime()}.zip`

fs.writeFile(tmpPath, response.body, 'binary')