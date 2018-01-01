import Rx from 'rxjs'
import { addMessage, addUser, removeUser } from './utilities'
import connection from './connection'
import submitAction$ from './actions'

// Ask user for username
let username = prompt('Please enter a username', '')

// If no username, generate random
if (!username) {
  const randomNum = Math.floor(Math.random() * 1000)
  username = 'user' + randomNum
}

// Send username to server
const username$ = Rx.Observable.of(username)
connection.send(username$, 'save username')

// Add messages to DOM
const submitMessage$ = submitAction$
  .do(message => addMessage(username, message))

// Send chat messages to server
connection.send(submitMessage$, 'chat message')

// Listen for chat messages
connection.listen('chat message')
  .subscribe(data => addMessage(data.from, data.message))

// Listen for list of all connected users
connection.listen('all users')
  .subscribe(users => {
    addUser('everyone', 'everyone', true)
    users.forEach(user => addUser(user.id, user.username))
  })

// Listen for new users
connection.listen('new user')
  .subscribe(user => addUser(user.id, user.username))

// Listen for user removals
connection.listen('remove user')
  .subscribe(id => removeUser(id))
