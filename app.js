const express = require('express');
const app     = express();
const http    = require('http').Server(app);
const io      = require('socket.io')(http);
const port    = process.env.PORT || 3000;

// Serve static files
app.use(express.static('public'))

// Routes
app.get('/', function(req, res) {
    res.sendFile('/index.html');
});

// Socket.io
io.on('connection', function(socket) {
    socket.on('chat message', function(msg) {
        io.emit('chat message', msg);
    });
});

// Start app listening
http.listen(port, function() {
    console.log('listening on *:' + port);
});