const express = require('express')
const app     = express()
const http    = require('http').Server(app)
const io      = require('socket.io')
const Rx      = require('rxjs')
const port    = process.env.PORT || 3000

const io$ = Rx.Observable.of(io(http))
const { connection$, disconnect$ } = require('./connection')(io$)
const { getAllUsers } = require('./utilities')

// Serve static files
app.use(express.static('public'))

// Start app listening
http.listen(port, () => console.log('listening on port: ' + port))

// On connection, send array of all users
connection$
  .subscribe(({ io, client }) => {
    client.emit('all users', getAllUsers(io.sockets.sockets))
  })

// On disconnect, tell other users
disconnect$
  .subscribe(client => {
    client.broadcast.emit('remove user', client.id)
  })

// Listen for message events
connection$
  .mergeMap(({ client }) => {
    return Rx.Observable.fromEvent(client, 'chat message')
      .map(data => ({ client, data }))
      .takeUntil(disconnect$)
  })
  .subscribe(({ client, data }) => {
    if (!data.socketId) return

    const messageObj = {
      from: client.username,
      message: data.message
    }

    if (data.socketId == 'everyone') {
      // Send message to everyone
      client.broadcast.emit('chat message', messageObj)
    } else {
      // Send message only to selected socket
      client.broadcast.to(data.socketId).emit('chat message', messageObj)
    }
  })

// Check for new user and store username in socket object
connection$
  .mergeMap(({ io, client }) => {
    return Rx.Observable.fromEvent(client, 'save username')
      .map(username => ({ io, client, username }))
      .takeUntil(disconnect$)
  })
  .subscribe(({ io, client, username }) => {
    io.sockets.sockets[client.id].username = username
    client.broadcast.emit('new user', {
      id: client.id,
      username: username
    })
  })
