const express = require('express')
const app     = express()
const http    = require('http').Server(app)
const io      = require('socket.io')(http)
const Rx      = require('rxjs')
const port    = process.env.PORT || 3000

// Serve static files
app.use(express.static('public'))

// Routes
app.get('/', (req, res) => res.sendFile('/index.html'))

// Get all users
const getAllUsers = () => {
  const allSockets = io.sockets.sockets
  return Object.keys(allSockets)
    .filter(key => allSockets[key].username)
    .map(key => ({
      id: key,
      username: allSockets[key].username
    }))
}

// Connection stream
const connection$ = Rx.Observable.fromEvent(io, 'connection')

// Disconnection stream
const disconnect$ = connection$
  .mergeMap(client => 
    Rx.Observable
      .fromEvent(client, 'disconnect')
      .map(() => client)
  )

// Chat message stream
const chatMessage$ = connection$
  .mergeMap(client => 
    Rx.Observable
      .fromEvent(client, 'chat message')
      .map(message => ({ client, message }))
      .takeUntil(disconnect$)
  )

// Save username stream
const saveUsername$ = connection$
  .mergeMap(client => 
    Rx.Observable
      .fromEvent(client, 'save username')
      .map(username => ({ client, username }))
      .takeUntil(disconnect$)
  )

// On connection, send array of all users
connection$
  .subscribe(client => client.emit('all users', getAllUsers()))

// On disconnect, tell other users
disconnect$
  .subscribe(client => client.broadcast.emit('remove user', client.id))

// Listen for message events
chatMessage$
  .subscribe(({ client, message }) => {
    client.broadcast.emit('chat message', {
      from: client.username,
      message: message
    })
  })

// Check for new user and store username in socket object
saveUsername$
  .subscribe(({ client, username }) => {
    io.sockets.sockets[client.id].username = username
    client.broadcast.emit('new user', {
      id: client.id,
      username: username
    })
  })

// Start app listening
http.listen(port, () => console.log('listening on *:' + port))
