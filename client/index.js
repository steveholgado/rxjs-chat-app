import { of } from 'rxjs'
import { withLatestFrom } from 'rxjs/operators'
import { getUsername, addMessage, addUser, clearUsers, clearUserInput, removeUser } from './utilities'
import { listenOnConnect, emitOnConnect } from './connection'
import sendMessage$ from './actions'

const username$ = of(getUsername())

// Send username to server
emitOnConnect(username$)
  .subscribe(({ socket, data }) => {
    const username = data
    socket.emit('save username', username)
  })

// Send chat messages to server
emitOnConnect(sendMessage$)
  .pipe(
    withLatestFrom(username$)
  )
  .subscribe(([ { socket, data }, username ]) => {
    const [ message, id ] = data
    clearUserInput()
    addMessage(username, message) // Add own chat message to DOM
    socket.emit('chat message', { id, message })
  })

// Listen for chat messages
listenOnConnect('chat message')
  .subscribe(({ from, message }) => {
    addMessage(from, message)
  })

// Listen for list of all connected users
listenOnConnect('all users')
  .subscribe(users => {
    clearUsers()
    addUser('everyone', 'Everyone')
    users.forEach(({ id, username }) => addUser(id, username))
  })

// Listen for new users
listenOnConnect('new user')
  .subscribe(({ id, username }) => {
    addUser(id, username)
  })

// Listen for user removals
listenOnConnect('remove user')
  .subscribe(id => {
    removeUser(id)
  })
