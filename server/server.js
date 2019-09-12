const express = require('express')
const http = require('http')
const app = express()

if (process.env.NODE_ENV === 'production') {
  // Serve built client files
  app.use(express.static('dist'))
}
else {
  // Let Parcel handle requests
  const Bundler = require('parcel-bundler')
  const bundler = new Bundler('client/index.html')
  app.use(bundler.middleware())
}

// Create HTTP server with "app" as handler
const server = http.createServer(app)

module.exports = server
