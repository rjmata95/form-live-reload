const express = require('express')
const { ExpectationFailed } = require('http-errors')

var app = express();
const port = process.env.PORT || 3000;


app.use('/', express.static('src'))


app.listen(port)
console.log(`Listening on port ${port}`)
