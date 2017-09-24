$(function() {
  var socket = io();

  // Ask user for username and store in socket object
  socket.username = prompt('Please enter a username:');

  // Add welcome message
  $('#messages').append($('<li>').text('Welcome to the chat'));

  // Create disconnection observable
  var disconnect$ = Rx.Observable.fromEvent(socket, 'disconnect');

  // Listen for connections
  Rx.Observable
    .fromEvent(socket, 'connect')
    .subscribe(() => {

      // Send username to server
      socket.emit('save username', socket.username);

      // Listen for form submit events
      Rx.Observable
        .fromEvent($('form'), 'submit')
        .takeUntil(disconnect$)
        .do(e => e.preventDefault())
        .map(() => $('#message-box').val())
        .subscribe(message => {
          $('#message-box').val('')
          $('#messages').append($('<li>').text(socket.username + ': ' + message))
          socket.emit('chat message', message)
        });

      // Listen for messages and attach to DOM
      Rx.Observable
        .fromEvent(socket, 'chat message')
        .takeUntil(disconnect$)
        .subscribe(data => {
          $('#messages').append($('<li>').text(data.from + ': ' + data.message));
          window.scrollTo(0, document.body.scrollHeight);
        });

      // Listen for all users and rebuild DOM
      Rx.Observable
        .fromEvent(socket, 'all users')
        .takeUntil(disconnect$)
        .subscribe(users => {
          $('#users').html('');
          $('#users').append($('<option>').val('everyone').text('everyone'));
          users.forEach(user => {
            $('#users').append($('<option>').val(user.id).text(user.username));
          });
        });

      // Listen for new users and add to DOM
      Rx.Observable
        .fromEvent(socket, 'new user')
        .takeUntil(disconnect$)
        .subscribe(users => {
          users.forEach(user => {
            $('#users').append($('<option>').val(user.id).text(user.username));
          });
        });

      // Listen for disconnected users and remove from DOM
      Rx.Observable
        .fromEvent(socket, 'remove user')
        .takeUntil(disconnect$)
        .subscribe(id => {
          $('#users option[value=' + id + ']').remove();
        });

    });
});