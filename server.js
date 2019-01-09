const express = require('express')
const app     = express()
const http    = require('http').Server(app)
const io      = require('socket.io')
const PORT    = process.env.PORT || 3000

const { of, fromEvent } = require('rxjs')
const { map, mapTo, switchMap, mergeMap, takeUntil } = require('rxjs/operators')

// Serve static files
app.use(express.static('public'))

// Start app listening
http.listen(PORT, () => console.log('listening on port: ' + PORT))

// Initialise Socket.IO and wrap in observable
const io$ = of(io(http))

// Stream of connections
const connection$ = io$
  .pipe(
    switchMap(io =>
      fromEvent(io, 'connection')
        .pipe(
          map(client => ({ io, client }))
        )
    )
  )

// Stream of disconnections
const disconnect$ = connection$
  .pipe(
    mergeMap(({ client }) =>
      fromEvent(client, 'disconnect')
        .pipe(
          mapTo(client)
        )
    )
  )

// On connection, listen for event
const listenOnConnect = (event) =>
  connection$
    .pipe(
      mergeMap(({ io, client }) =>
        fromEvent(client, event)
          .pipe(
            takeUntil(
              fromEvent(client, 'disconnect')
            ),
            map(data => ({ io, client, data }))
          )
      )
    )

// On connection, send array of all users
connection$
  .subscribe(({ io, client }) => {
    const allSockets = io.sockets.sockets
    const allUsers = Object.keys(allSockets)
      .filter(id => allSockets[id].username)
      .map(id => ({ id, username: allSockets[id].username }))

    client.emit('all users', allUsers)
  })

// On disconnect, tell other users
disconnect$
  .subscribe(client => {
    client.broadcast.emit('remove user', client.id)
  })

// Listen for message events and send to relevant users
listenOnConnect('chat message')
  .subscribe(({ client, data }) => {
    const from = client.username
    const { id, message } = data

    if (!id) return

    id === 'everyone'
      ? client.broadcast.emit('chat message', { from, message }) // Send to everyone
      : client.broadcast.to(id).emit('chat message', { from, message }) // Send only to socket
  })

// Listen for new usernames and store in corresponding socket object
listenOnConnect('save username')
  .subscribe(({ io, client, data: username }) => {
    const allSockets = io.sockets.sockets
    const id = client.id

    allSockets[id].username = username

    client.broadcast.emit('new user', { id, username })
  })
