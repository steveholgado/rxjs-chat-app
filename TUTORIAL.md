# Build a chat app with RxJS and Socket.IO

A chat application is a great project for learning RxJS and it's one of the first things I built when I started learning it.

Hopefully, this tutorial should be easy enough to follow for those relatively new to RxJS and can easily be extended and improved upon with your own features.

We will utilise RxJS on both the client-side and the server-side and we'll also be using Socket.IO to handle real-time communication using web sockets.


## Table of contents

- [Assumptions](#assumptions)
- [Project setup](#project-setup)
- [Adding our HTML](#adding-our-html)
- [Adding our CSS](#adding-our-css)
- [Setting up Express](#setting-up-express)
- [Setting up Parcel bundler](#setting-up-parcel-bundler)
- [Server-side connections](#server-side-connections)
- [Client-side connections](#client-side-connections)
- [Checking our connections](#checking-our-connections)
- [Sending and receiving on the client-side](#sending-and-receiving-on-the-client-side)
- [Requesting a username](#requesting-a-username)
- [Receiving usernames on the server-side](#receiving-usernames-on-the-server-side)
- [Reacting to new users on the client-side](#reacting-to-new-users-on-the-client-side)
- [Sending all users on new connections](#sending-all-users-on-new-connections)
- [Removing a user when they disconnect](#removing-a-user-when-they-disconnect)
- [Sending chat messages from the client-side](#sending-chat-messages-from-the-client-side)
- [Receiving chat messages on the server-side](#receiving-chat-messages-on-the-server-side)
- [Receiving chat messages on the client-side](#receiving-chat-messages-on-the-client-side)
- [Building for production](#building-for-production)

## Assumptions

I will assume that you have a basic understanding of RxJS and the most common pipeable operators.

This app won't make advanced usage of Socket.IO so, if you haven't used it before, it shouldn't be a problem.


## Project setup

We're going to use Express on the server so let's install it as a dependency along with RxJS and Socket.IO:

```bash
npm install rxjs@6.5.3 socket.io@2.2.0 socket.io-client@2.2.0 express@4.17.1
```

_Make sure to use these exact versions for compatibility._

We're going to use Parcel to bundle our client-side code and Nodemon to run our development server with auto-reloading when we change a file.

So let's install these dev-dependencies too:

```bash
npm install --save-dev parcel-bundler@1.12.3 nodemon@1.19.2
```

_Make sure to use these exact versions for compatibility._

The dependencies in our `package.json` file should now look like this:

```json
...

"dependencies": {
  "express": "^4.17.1",
  "rxjs": "^6.5.3",
  "socket.io": "^2.2.0",
  "socket.io-client": "^2.2.0"
},
"devDependencies": {
  "nodemon": "^1.19.2",
  "parcel-bundler": "^1.12.3"
},

...
```

Let's now create some files inside our project directory:

```bash
chat-app/
  - client/
    - index.html
    - index.js
    - styles.css
  - server/
    - index.js
    - server.js
```

We're going to bundle our client-side code, using Parcel, into a `dist/` directory, where we can serve them with Express.

With Parcel, we can just include links to our entry JavaScript and CSS files in our `index.html` file and Parcel will take care of bundling everything from there.


## Adding our HTML

Before we get going with the app functionality, let's quickly add some markup and styling.

Let's add the following content to `client/index.html`:

```html
<!doctype html>
<html>
  <head>
    <title>RxJS Chat App</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="./styles.css">
  </head>
  <body>
    <ul class="messages"></ul>

    <div class="actions">
      <label class="users-label">
        <select class="users"></select>
      </label>
      <input class="input" />
      <button class="send">Send</button>
    </div>
    
    <script src="./index.js"></script>
  </body>
</html>
```

Parcel will automatically bundle any assets that we reference so we have included our entry JavaScript file, `<script src="./index.js">`, and our stylesheet, `<link rel="stylesheet" href="./styles.css">`, as mentioned earlier.

We have an empty `<ul>`, which we'll populate with our chat messages, and an actions bar, which contains a drop-down box with the usernames of other connected users, a text input field and a button to send messages.


## Adding our CSS

We can add our styles to `client/styles.css`:

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
body {
  font-size: 14px;
  font-family: Helvetica, Arial, sans-serif;
}

/* MESSAGE LIST
************************************************** */
.messages {
  list-style-type: none;
  margin: 0;
  margin-bottom: 90px;
  padding: 0;
}
.messages li {
  padding: 10px 15px;
}
.messages li:nth-child(odd) {
  background: #EEE;
}
.messages li span {
  color: #AAA;
}

/* ACTION BAR
************************************************** */
.actions {
  display: flex;
  justify-content: space-between;
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 10px;
  background-color: #6B5C74;
}

/* USER SELECT
************************************************** */
.users-label {
  position: relative;
  width: 30%;
  border-right: 1px solid transparent;
}
.users-label:after {
  content: '';
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-top: 6px solid black;
  border-right: 4px solid transparent;
  border-bottom: 0 solid transparent;
  border-left: 4px solid transparent;
  pointer-events: none;
}

.users {
  width: 100%;
  padding: 10px;
  padding-right: 20px;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  border-radius: 0;
  background-color: #EEE;
  border: none;
  outline: none;
  font-size: 14px;
  cursor: pointer;
  transition: all .25s ease;
}
.users:hover {
  background-color: #CCC;
}

/* MESSAGE INPUT
************************************************** */
.input {
  width: 45%;
  padding: 10px;
  margin-right: .5%;
  border: 0;
  outline: none;
  font-size: 14px;
}

/* SEND BUTTON
************************************************** */
.send {
  width: 25%;
  padding: 10px;
  background-color: #74CADA;
  border: none;
  font-size: 14px;
  cursor: pointer;
  transition: all .25s ease;
}
.send:hover {
  background-color: #3FB5CB;
}

/* MEDIA QUERIES
************************************************** */
@media screen and (min-width: 600px) {
  .users-label {
    width: 20%;
  }
  .input {
    width: 65%;
  }
  .send {
    width: 15%;
  }
}

@media screen and (min-width: 769px) {
  .users-label {
    width: 15%;
  }
  .input {
    width: 75%;
  }
  .send {
    width: 10%;
  }
}
```


## Setting up Express

We are going to put our Express app in its own file so that it can be imported into other files later on.

So, let's add the following to `server/server.js`:

```js
const express = require('express')
const http = require('http')
const app = express()

// Create HTTP server with "app" as handler
const server = http.createServer(app)

module.exports = server
```

We create a server using `createServer` from the `http` package directly by passing the Express app as the handler. We need to do this as we'll need a HTTP server in order to initialise Socket.IO later on.

We can now go over to `server/index.js`, import our server and start it listening for requests:

```js
const server = require('./server')

// Start server listening
server.listen(3000, () => console.log('listening on port: 3000'))
```


## Setting up Parcel bundler

Usually, Parcel will run a development server for you. However, as this is not purely a client-side app and we are running our own server, we can use configure our Express app to hand over control of serving our bundled assets to Parcel.

Parcel provides Express middleware that we can use to have our static assets served from our server, complete with hot-reload:

```js
const express = require('express')
const http = require('http')
const app = express()

// Let Parcel handle requests
const Bundler = require('parcel-bundler')
const bundler = new Bundler('client/index.html')
app.use(bundler.middleware())

// Create HTTP server with "app" as handler
const server = http.createServer(app)

module.exports = server
```

Let's now add a script to our `package.json` to start our server:

```json
"scripts": {
  "start": "NODE_ENV=development nodemon server/index.js"
},
"nodemonConfig": {
  "watch": "server/*"
},
```

We are using **Nodemon** to run our server in development mode as it can restart the server automatically when a file changes.

By default, Nodemon will restart the server if _any_ file in the project changes. Parcel is already handling changes to our client-side code so we only want the server to restart if our server-side code changes.

Therefore, we have added a `nodemonConfig` to our `package.json` to tell Nodemon which files to watch.


## Server-side connections

Finally, on to the good stuff.

We are going to need some observables to handle client connections to our server.

Let's create a new file, `server/connection.js`:

```js
const { of, fromEvent } = require('rxjs')
const { map, switchMap } = require('rxjs/operators')
const io = require('socket.io')
const server = require('./server')

// Initialise Socket.IO and wrap in observable
const io$ = of(io(server))

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
```

First, we import our server that we created earlier and use it to initialise Socket.IO, wrapped in an observable of course.

Then we create another observable for client connections.

Our `io$` stream will emit the Socket.IO object, `io`. It will only emit once on initialisation, and when it does, our `connection$` stream uses the `switchMap` operator to switch over to a new observable listening for "connection" events.

On a "connection" event, a `client` object is emitted, representing the individual socket for the connected client. We'll also want to retain access to the `io` object so we can use the `map` operator to forward both `io` (from the scope above) and `client` downstream.

Let's now create another observable to listen for disconnections:

```js
const { of, fromEvent } = require('rxjs')
const { map, switchMap, mergeMap, takeUntil } = require('rxjs/operators')

// ...

// Stream of disconnections
const disconnect$ = connection$
  .pipe(
    mergeMap(({ client }) =>
      fromEvent(client, 'disconnect')
        .pipe(
          map(() => client)
        )
    )
  )
```

Our `disconnect$` stream takes the emitted client objects from our `connection$` stream and uses the `mergeMap` operator to merge in streams listening for "disconnect" events.

We'll need the `mergeMap` operator this time, instead of `switchMap`, as our `connection$` stream will emit multiple times (whenever a new client connects) and we want to retain all of these.

Therefore, we have a stream that emits on _any_ disconnection.

A "disconnect" event doesn't actually emit a `client` object so we need to forward it downstream ourselves. We use the `map` operator for this.

Let's now create some temporary subscriptions, just so we can test that we are receiving connections from our client, which we'll start building in the next section.

In our `server/index.js`, we can add the following:

```js
const { connection$, disconnect$ } = require('./connection')

// ...

// Temporary subscriptions
connection$.subscribe(({ client }) => {
  console.log('connected: ', client.id)
})

disconnect$.subscribe(client => {
  console.log('disconnected: ', client.id)
})
```


## Client-side connections

Let's start by creating a new file, `client/connection.js`, with the following content:

```js
import { of, fromEvent } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'
import io from 'socket.io-client'

// Initialise Socket.IO and wrap in observable
const socket$ = of(io())

// Stream of connections
const connect$ = socket$
  .pipe(
    switchMap(socket =>
      fromEvent(socket, 'connect')
        .pipe(
          map(() => socket)
        )
    )
  )
```

First, we initialise Socket.IO and wrap it in an observable, `socket$`, similar to what we did on the server-side.

We then create an observable for connections. When our `socket$` observable emits (once on initialisation), our `connect$` stream uses the `switchMap` operator to switch to a stream of "connect" events on the socket.

We then forward the `socket` object to any further operators or subscriptions downstream using the `map` operator.


## Checking our connections

Let's start up our development server:

```
npm start
```

When it's done bundling, we can navigate to `localhost:3000` in a web browser and we will see "connected" logged to our terminal where our server is running.

If we close our browser window, we will see "diconnected" logged to our terminal.

Great. So we have our client and our server connected.

We can now remove our temporary subscriptions.


## Sending and receiving on the client-side

Continuing with our `client/connection.js` file, let's add a new function so that we can listen to events on the connected socket:

```js
// ...

// On connection, listen for event
export function listenOnConnect(event) {
  return connect$
    .pipe(
      switchMap(socket =>
        fromEvent(socket, event)
      )
    )
}
```

Our `listenOnConnect` function returns a new observable that waits for a connection on the `connect$` stream and then switches to listening for the specified events on the socket.

Let's now add another function to emit data when connected:

```js
// ...

// On connection, emit data from observable
export function emitOnConnect(observable$) {
  return connect$
    .pipe(
      switchMap(socket =>
        observable$
          .pipe(
            map(data => ({ socket, data }))
          )
      )
    )
}
```

Our `emitOnConnect` function takes an observable as an argument. We wait for our `connect$` stream to emit and then switch to the observable that we passed in.

We also use the `map` operator so that we can forward on the connected `socket` object along with the emitted data, for use further downstream.


## Requesting a username

When a user opens our application we'll need to ask for a username so that other users can see who is connected.

First, let's create a `client/utilities.js` file. In it let's export a new function that we'll use to request a username from our user:

```js
export function getUsername() {
  let username = prompt('Please enter a username', '')

  // If no username entered by user, generate random
  if (!username) {
    const randomNum = Math.floor(Math.random() * 1000)
    username = 'user' + randomNum
  }

  return username
}
```

Our `getUsername` function will trigger a prompt asking the user to enter a username.

If the user decides to press the `cancel` button then we generate a random username for them, for example **user123**.

Now, we don't really want to re-enter our username everytime the page refreshes, especially as we have hot-reload enabled, as this could become annoying. Therefore, let's store the username in session storage so that it's available for the life of our session:

```js
export function getUsername() {
  const username = sessionStorage.getItem('username')

  if (username) return username

  let newUsername = prompt('Please enter a username', '')

  // If no username entered by user, generate random
  if (!newUsername) {
    const randomNum = Math.floor(Math.random() * 1000)
    newUsername = 'user' + randomNum
  }

  sessionStorage.setItem('username', newUsername)

  return newUsername
}
```

We use session storage rather than local storage so that we can have different usernames in different browser tabs.

Over in our `client/index.js` file we can now import our `getUsername` function and invoke it, wrapped in an observable:

```js
import { of } from 'rxjs'
import { getUsername } from './utilities'
import { emitOnConnect } from './connection'

const username$ = of(getUsername())

// Send username to server
emitOnConnect(username$)
  .subscribe(({ socket, data }) => {
    const username = data
    socket.emit('save username', username)
  })
```

We use our `emitOnConnect` function to send our username to the server as a "save username" event.

So, our `emitOnConnect` function switches to our `username$` stream when our `connect$` stream emits.

As soon as we enter a username, our `username$` stream will emit and we send a "save username" event to the server on the connected socket.

Navigate to `localhost:3000` and we should see a prompt asking for a username.

Let's now go over to the server and handle receiving these "save username" events.


## Receiving usernames on the server-side

In our `server/connection.js` file, let's create a new function for listening to events:

```js
const { of, fromEvent } = require('rxjs')
const { map, switchMap, mergeMap, takeUntil } = require('rxjs/operators')

// ...

function listenOnConnect(event) {
  return connection$
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
}
```

Our `listenOnConnect` function will wait for our `connection$` stream to emit when a new client connects. We'll then use the `mergeMap` operator to _merge_ in a new observable from the specified event name on the connected client socket.

We also use the `takeUntil` operator here to end each stream when a disconnection occurs on that specific client socket. We can't use our existing `disconnect$` stream here as it will emit on _any_ client disconnection, but we want this stream to end only when this _specific_ client disconnects.

Our `connection$` stream emits both the `io` object and the `client` object so we can use the `map` operator to make sure that we forward them downstream along with the data emitted from the new observable.

We now have a function that we can re-use to create new observales that listen for events coming from any connected sockets.

Let's use our new `listenOnConnect` function to react to "save username" events.

We are going to put our subscriptions (side-effects) in `server/index.js`:

```js
const { listenOnConnect } = require('./connection')

// ...

// Listen for new usernames and store in corresponding socket object
listenOnConnect('save username')
  .subscribe(({ io, client, data }) => {
    const allSockets = io.sockets.sockets
    const id = client.id
    const username = data

    // Store username in socket
    allSockets[id].username = username

    // Inform other users of new user
    client.broadcast.emit('new user', { id, username })
  })
```

We are subscribing to the observable returned from the `listenOnConnect` call, so that we can store the username and notify the other sockets of the new connection.

Firstly, we are storing the emitted username as a property of the specific connected socket within the `io` object.

Socket.IO stores the connected socket objects at `io.sockets.sockets`, where each key is the socket id.

In our subscription, we also emit a "new user" event to all other sockets and we send the socket's `id` and `username` as the payload.

The `broadcast` flag in `client.broadcast.emit(...)` will ensure that the event is emitted to all connected sockets _except_ the socket that is doing the emitting.


## Reacting to new users on the client-side

Back on the client-side we can use our `listenOnConnect` function to create a stream of "new user" events from the server and react accordingly.

As with the server-side, we are going to put our subscriptions (side-effects) in `client/index.js`:

```js
import { of } from 'rxjs'
import { getUsername, addUser } from './utilities' // Added 'addUser'
import { emitOnConnect, listenOnConnect } from './connection' // Added 'listenOnConnect'

// ...

// Listen for new users
listenOnConnect('new user')
  .subscribe(({ id, username }) => {
    addUser(id, username) // <-- We'll create this soon
  })
```

So, when our client connects, the `listenOnConnect` call will switch to an observable listening for "new user" events.

We then subscribe to the returned observable and use a utility function (which we'll create shortly) to add the new user to the DOM.

Let's go over to `client/utilities.js` and create the `addUser` function:

```js
// ...

export function addUser(id, username) {
  document.querySelector('.users')
    .insertAdjacentHTML(
      'beforeend',
      `<option value=${id}>${username}</option>`
    )
}
```

Our `addUser` function takes an `id` and a `username` as arguments, which we use to insert a new `<option>` element into our drop-down list of other connected users.

Now, if we navigate to `localhost:3000` in two separate browser tabs, we should see the second tab's username appear in the first tab's drop-down list.

Currently, we won't see the first tab's username appear in the second tab's list as the event would have been fired _before_ the second tab connected and started listening. We'll take care of this situtation in the next section.


## Sending all users on new connections

Let's remedy the problem we just had in the last section where the list of connected sockets only includes those that connected _after_ the current client.

In our `server/index.js` file, let's subscribe to our `connection$` stream and emit an "all users" event with a list of all the connected sockets as the payload:

```js
const { connection$, listenOnConnect } = require('./connection')

// ...

// On connection, send array of all users
connection$
  .subscribe(({ io, client }) => {
    const allSockets = io.sockets.sockets

    const allUsers = Object.entries(allSockets)
      .map(([ id, socket ]) => ({ id, username: socket.username }))
      .filter(({ username }) => username)

    client.emit('all users', allUsers)
  })
```

We take an array of all the connected socket ids and map over it to produce an array of objects containing the socket id and the corresponding username. We also filter out any that don't have a username.

We then emit an "all users" event, sending the array of users as the payload.

Let's now listen for these "all users" events on the client-side.

In our `client/index.js` file we can now add the users to the DOM:

```js
import { getUsername, addUser, clearUsers } from './utilities'

// ...

// Listen for list of all connected users
listenOnConnect('all users')
  .subscribe(users => {
    clearUsers() // <-- We'll create this soon
    addUser('everyone', 'Everyone')
    users.forEach(({ id, username }) => addUser(id, username))
  })
```

We subscribe to the observable returned from our `listenOnConnect` call.

First, we clear the users drop-down list using a utility function, `clearUsers`, which we'll create soon. We add "Everyone" as the first option in the list and then add each of the users from the payload that we received.

Let's go over to `client/utilities.js` and create the `clearUsers` function:

```js
// ...

export function clearUsers() {
  document.querySelector('.users').innerHTML = ''
}
```

Now, back to the browser and open `localhost:3000` in two separate tabs. We will see in each tab that the user selection drop-down list contains the username of the other tab as well as the "Everyone" option.


## Removing a user when they disconnect

In `server/index.js` let's notify all other connected clients when a client disconnects:

```js
const { connection$, disconnect$, listenOnConnect } = require('./connection')

// ...

// On disconnect, tell other users
disconnect$
  .subscribe(client => {
    client.broadcast.emit('remove user', client.id)
  })
```

We subscribe to our `disconnect$` stream and emit a "remove user" event to all other clients, passing along the disconnected client's id as the payload.

We are using the `broadcast` flag again to ensure we emit to all sockets _except_ the socket doing the emitting.

We can now listen for the "remove user" events on the client-side.

In `client/index.js` let's add the following:

```js
import { getUsername, addUser, clearUsers, removeUser  } from './utilities' // Added 'removeUser'

// ...

// Listen for user removals
listenOnConnect('remove user')
  .subscribe(id => {
    removeUser(id) // <-- We'll create this soon
  })
```

In our subscription, we're just removing the user from the DOM using another utility function, `removeUser`.

In `client/utilities.js` let's create and export this new function:

```js
// ...

export function removeUser(id) {
  const optionToRemove = document.querySelector(`.users option[value="${id}"]`)

  if (optionToRemove) {
    optionToRemove.parentNode.removeChild(optionToRemove)
  }
}
```

This simply selects the `<option>` element with a value of the specified id and removes the node from the DOM.

If we now open multiple browser tabs (3+) at `localhost:3000`, we'll see all the other connected users in the drop-down list on each tab.

If we then close one of the tabs, we'll see that the disconnected user has been removed from the list on all other tabs.


## Sending chat messages from the client-side

Finally, on to sending some chat messages.

We'll start by creating some observables for listening to user input.

Let's create a new file, `client/actions.js`, and add the following content:

```js
import { fromEvent, merge } from 'rxjs'
import { map, filter, startWith } from 'rxjs/operators'

// DOM elements
const sendButton = document.querySelector('.send')
const inputBox = document.querySelector('.input')
const userSelect = document.querySelector('.users')

// Clicks on 'Send' button
const sendButtonClick$ = fromEvent(sendButton, 'click')

// Enter key presses in message input field
const enterKeyPress$ = fromEvent(inputBox, 'keypress')
  .pipe(
    filter(e => e.keyCode === 13) // "Enter" key
  )

// Message send stream
const sendMessage$ = merge(sendButtonClick$, enterKeyPress$)
  .pipe(
    map(() => inputBox.value),
    filter(message => message)
  )
```

Firstly, we have created an observable from _clicks_ on our "Send" button.

Then we have created another observable from _key presses_ in our text input field, which we have filtered to include only the "Enter" key (code 13).

Both of these actions will be used to send the message so we _merge_ them together to form a new observable, `sendMessage$`, which is mapped to the value of the text in the input field usign the `map` operator.

So we now have a stream of chat messages emitting every time a user either clicks on the "Send" button _or_ presses the "Enter" key.

We filter out any empty messages in case the user presses enter without typing anything.

Now let's handle changes to the user selection drop-down so that a user can change who the message will be sent to.

Still in `client/actions.js` let's add the following observable:

```js
// ...

// Changes to user-select drop-down
const userSelectChange$ = fromEvent(userSelect, 'change')
  .pipe(
    map(e => e.target.value),
    startWith('everyone')
  )
```

We are listening for changes to the drop-down field and mapping the stream to the _value_ of that field. We then start the stream off with the "everyone" value.

Now we can extend our `sendMessage$` stream by combining it with the most recently emitted value from our new `userSelectChange$` stream:

```js
import { fromEvent, merge } from 'rxjs'
import { map, filter, startWith, withLatestFrom } from 'rxjs/operators'

// ...

// Changes to user-select drop-down
const userSelectChange$ = fromEvent(userSelect, 'change')
  .pipe(
    map(e => e.target.value),
    startWith('everyone')
  )

// Message send stream
const sendMessage$ = merge(sendButtonClick$, enterKeyPress$)
  .pipe(
    map(() => inputBox.value),
    filter(message => message),
    withLatestFrom(userSelectChange$)
  )

export default sendMessage$
```

Using the `withLatestFrom` operator means that we now have an array being emitted; the `message` content from the `sendMessage$` stream and the socket `id` of the chosen recipient from the `userSelectChange$` stream.

Finally, we export the `sendMessage$` observable from this module.

Now, back over in our `client/index.js` file, we can import our `sendMessage$` stream, combine it with the user's username and start sending messages to the server:

```js
import { of } from 'rxjs'
import { withLatestFrom } from 'rxjs/operators'
import { getUsername, addUser, clearUsers, clearUserInput, addMessage  } from './utilities'
import { listenOnConnect, emitOnConnect } from './connection'
import sendMessage$ from './actions'

// ...

// Send chat messages to server
emitOnConnect(sendMessage$)
  .pipe(
    withLatestFrom(username$)
  )
  .subscribe(([ { socket, data }, username ]) => {
    const [ message, id ] = data
    clearUserInput() // <-- We'll create this soon
    addMessage(username, message) // <-- We'll create this soon
    socket.emit('chat message', { id, message })
  })
```

We use our `emitOnConnect` function to start sending "chat message" events to the server with our data as the payload.

We are taking our imported `sendMessage$` stream and combining it with the most recently emitted (and only) value from our `username$` stream.

In our subscription, we first clear the user text input box using a utility function, `clearUserInput`, which we'll create soon.

There's no sense in waiting for our own messages to go to the server and then back to us before adding them to the DOM so we add our new message directly to the DOM using another utility function, `addMessage`, which we'll also create in just a moment.

Then we emit a "chat message" event to the server along with the id of the recipient and the message.

Now, we just need to create our new utility functions in our `client/utilities.js` file:

```js
// ...

export function clearUserInput() {
  document.querySelector('.input').value = ''
}

export function addMessage(username, message) {
  document.querySelector('.messages')
    .insertAdjacentHTML(
      'beforeend',
      `<li><span>${username}: </span>${message}</li>`
    )
  
  window.scrollTo(0, document.body.scrollHeight)
}
```

We are also scrolling to the bottom of the page after adding a new message to ensure that the latest messages are in view if there are too many to see on screen at once.


## Receiving chat messages on the server-side

We've started sending chat messages from the client. Now let's receive them on the server and forward them onto the relevant recipients.

in `server/index.js`, let's use our `listenOnConnect` function again to listen for "chat message" events:

```js
// ...

// Listen for message events and send to relevant users
listenOnConnect('chat message')
  .subscribe(({ client, data }) => {
    const from = client.username
    const { id, message } = data

    if (!id) return

    if (id === 'everyone') {
      // Send to everyone
      client.broadcast.emit('chat message', { from, message })
    }
    else {
      // Send only to recipient
      client.broadcast.to(id).emit('chat message', { from, message })
    }
  })
```

We subscribe to the returned observable and forward a "chat message" event to other sockets.

Now, if the intended recipient is "everyone" then we can broadcast the message to all connected sockets. Otherwise, we just send the message to the intended user using the recipient's socket id supplied in the data payload.


## Receiving chat messages on the client-side

So we are sending chat messages from the client, receiving them on the server and forwarding them to the intended recipients.

Now all we need to do is recieve these messages on the client-side.

In `client/index.js` let's use our `listenOnConnect` function again to listen for "chat message" events:

```js
// ...

// Listen for chat messages
listenOnConnect('chat message')
  .subscribe(({ from, message }) => {
    addMessage(from, message)
  })
```

We subscribe to the returned observable and add the message to the DOM using our `addMessage` function that we created earlier, supplying the username and message content from the payload.

That's it.

Let's navigate to `localhost:3000` in several browser tabs.

We should now be able to send messages to all users at once or to individual users using the user selection drop-down field.


## Building for production

One last thing...

In order to build for production, we need to amend our Express app in `server/server.js` to only use the Parcel middleware in development mode.

For production mode, we can simply serve static assets directly from the `dist/` directory:

```js
const express = require('express')
const http = require('http')
const app = express()

if (process.env.NODE_ENV === 'production') {
  // Serve built client files
  // Serves index.html by default from "/" route
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
```

Now we just need to add a couple more scripts to our `package.json`:

```json
"scripts": {
  "build": "parcel build client/index.html",
  "server": "NODE_ENV=production node server/index.js",
  "start": "NODE_ENV=development nodemon server/index.js"
},
```

We can then run a one-time build of our assets using Parcel:

```
npm run build
```

...and start our server in production mode using Node instead of Nodemon:

```
npm run server
```
