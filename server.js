const express = require('express');
const app     = express();
const http    = require('http').Server(app);
const io      = require('socket.io')(http);
const port    = process.env.PORT || 3000;
const Rx      = require('rx');

// Serve static files
app.use(express.static('public'))

// Routes
app.get('/', function(req, res) {
    res.sendFile('/index.html');
});

// Get all users
const getAllUsers = function() {
	const allSockets = io.sockets.sockets;
	return Object.keys(allSockets)
		.filter(key => allSockets[key].username)
		.map(key => {
			return { id: key, username: allSockets[key].username }
		});
};

// Listen for connections
Rx.Observable
	.fromEvent(io, 'connection')
	.subscribe(client => {

		// Create disconnection observable
		const disconnect$ = Rx.Observable.fromEvent(client, 'disconnect');

		// Send array of all users
		client.emit('all users', getAllUsers());

		// Listen for message events
		Rx.Observable
			.fromEvent(client, 'chat message')
			.takeUntil(disconnect$)
			.subscribe(message => client.broadcast.emit('chat message', {
				from: client.username,
				message: message
			}));

		// Check for new user and store username in socket object
		Rx.Observable
			.fromEvent(client, 'save username')
			.takeUntil(disconnect$)
			.do(username => io.sockets.sockets[client.id].username = username)
			.subscribe(username => {
				client.broadcast.emit('new user', [{
					id: client.id,
					username: username
				}]);
			});

		// On disconnect, tell other users
		disconnect$
			.subscribe(() => client.broadcast.emit('remove user', client.id));
		
	});

// Start app listening
http.listen(port, function() {
    console.log('listening on *:' + port);
});