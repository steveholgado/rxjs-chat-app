$(function() {

  // Socket stream
  const socket$ = Rx.Observable.of(io())

  // Connection stream
  const connection$ = socket$
    .mergeMap(socket => Rx.Observable
      .fromEvent(socket, 'connect')
      .map(() => socket)
    )

  // Disconnection stream
  const disconnect$ = connection$
    .mergeMap(socket => Rx.Observable
      .fromEvent(socket, 'disconnect')
      .map(() => socket)
    )

  // Form submit stream
  const formSubmit$ = connection$
    .mergeMap(socket => Rx.Observable
      .fromEvent($('form'), 'submit')
      .do(e => e.preventDefault())
      .map(() => ({
        socket: socket,
        message: $('#message-box').val()
      }))
      .takeUntil(disconnect$)
    )

  // Chat message stream
  const chatMessage$ = connection$
    .mergeMap(socket => Rx.Observable
      .fromEvent(socket, 'chat message')
      .takeUntil(disconnect$)
    )

  // All users stream
  const allUsers$ = connection$
    .mergeMap(socket => Rx.Observable
      .fromEvent(socket, 'all users')
      .takeUntil(disconnect$)
    )

  // New user stream
  const newUser$ = connection$
    .mergeMap(socket => Rx.Observable
      .fromEvent(socket, 'new user')
      .takeUntil(disconnect$)
    )

  // Remove user stream
  const removeUser$ = connection$
    .mergeMap(socket => Rx.Observable
      .fromEvent(socket, 'remove user')
      .takeUntil(disconnect$)
    )

  // On connection
  connection$
    .subscribe(socket => {
      // Ask use for username
      socket.username = prompt('Please enter a username:')

      // If no username, generate random
      if (!socket.username) {
        const randomNum = Math.floor(Math.random * 1000)
        socket.username = user + randomNum
      }

      // Tell server to store username in socket object
      socket.emit('save username', socket.username)

      // Add welcome message
      $('#messages').append($('<li>').text('Welcome to the chat'))
    })

  // Listen for form submit events
  formSubmit$
    .subscribe(({ socket, message }) => {
      $('#message-box').val('')
      const element = $('<li>').text(socket.username + ': ' + message)
      $('#messages').append(element)
      socket.emit('chat message', message)
    })

  // Listen for messages and attach to DOM
  chatMessage$
    .subscribe(data => {
      const element = $('<li>').text(data.from + ': ' + data.message)
      $('#messages').append(element)
      window.scrollTo(0, document.body.scrollHeight)
    })

  // Listen for all users and rebuild DOM
  allUsers$
    .subscribe(users => {
      $('#users').html('')
      $('#users').append($('<option>').val('everyone').text('everyone'))
      users.forEach(user => {
        const element = $('<option>').val(user.id).text(user.username)
        $('#users').append(element)
      })
    })

  // Listen for new users and add to DOM
  newUser$
    .subscribe(user => {
      const element = $('<option>').val(user.id).text(user.username)
      $('#users').append(element)
    })

  // Listen for disconnected users and remove from DOM
  removeUser$
    .subscribe(id => {
      $('#users option[value=' + id + ']').remove()
    })

})