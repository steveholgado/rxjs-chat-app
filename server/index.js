const server = require('./server')
const { connection$, disconnect$, listenOnConnect } = require('./connection')

// Start server listening
server.listen(3000, () => console.log('listening on port: 3000'))

// On connection, send array of all users
connection$
  .subscribe(({ io, client }) => {
    const allSockets = io.sockets.sockets

    const allUsers = Object.entries(allSockets)
      .map(([ id, socket ]) => ({ id, username: socket.username }))
      .filter(({ username }) => username)

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
    const { message, id } = data

    if (!id) return

    id === 'everyone'
      ? client.broadcast.emit('chat message', { from, message }) // Send to everyone
      : client.broadcast.to(id).emit('chat message', { from, message }) // Send only to recipient
  })

// Listen for new usernames and store in corresponding socket object
listenOnConnect('save username')
  .subscribe(({ io, client, data }) => {
    const allSockets = io.sockets.sockets
    const id = client.id
    const username = data

    allSockets[id].username = username

    client.broadcast.emit('new user', { id, username })
  })
