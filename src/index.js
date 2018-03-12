import Rx from 'rxjs'
import { requestUsername, addMessage, addUser, removeUser } from './utilities'
import { send, listen } from './connection'
import submitAction$ from './actions'

// Ask user for username
const username$ = Rx.Observable.of(requestUsername())

// Send username to server
send(username$, 'save username')

// Add own chat messages to DOM
const submitMessage$ = submitAction$
  .withLatestFrom(username$)
  .do(([ data, username ]) => addMessage(username, data.message))
  .map(([ data ]) => data)

// Send chat messages to server
send(submitMessage$, 'chat message')

// Listen for chat messages
listen('chat message')
  .subscribe(data => addMessage(data.from, data.message))

// Listen for list of all connected users
listen('all users')
  .subscribe(users => {
    addUser('everyone', 'Everyone', true)
    users.forEach(user => addUser(user.id, user.username))
  })

// Listen for new users
listen('new user')
  .subscribe(user => addUser(user.id, user.username))

// Listen for user removals
listen('remove user')
  .subscribe(id => removeUser(id))
