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

// Create connection observable
const connection$ = Rx.Observable.fromEvent(io, 'connection');

connection$
	.subscribe(client => {
		// Create observables
		const disconnect$ = Rx.Observable.fromEvent(client, 'disconnect');
		const message$    = Rx.Observable.fromEvent(client, 'chat message');

		// Send welcome message
		client.emit('chat message', 'Welcome to the chat');

		// Listen for message events
		message$
			.takeUntil(disconnect$)
			.subscribe(message => io.emit('chat message', message));
	});

// Start app listening
http.listen(port, function() {
    console.log('listening on *:' + port);
});