const { readFileSync } = require('fs')
const { join } = require('path')
const express = require('express')
const app = express()
const csv = readFileSync(join(__dirname, 'test', 'example-2.csv'))
const mw = require('.')(csv)
console.dir({ mw }, { depth: null })
app.use(mw).listen(3000)
console.log('server listening on http://localhost:3000')
