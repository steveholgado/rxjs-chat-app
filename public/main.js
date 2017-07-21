$(function() {
    var socket = io();

    // Emit event on form submit
    $('form').submit(function() {
        socket.emit('chat message', $('#m').val());
        $('#m').val('');
        return false;
    });

    // Listen for messages and attach to DOM
    socket.on('chat message', function(msg) {
        $('#messages').append($('<li>').text(msg));
        window.scrollTo(0, document.body.scrollHeight);
    });
});