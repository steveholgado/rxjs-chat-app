$(function() {
    var socket = io();

    // Create obeservables
    var formSubmit$ = Rx.Observable.fromEvent($('form'), 'submit');
    var message$    = Rx.Observable.fromEvent(socket, 'chat message');

    // Listen for form submit events
    formSubmit$
        .do(e => e.preventDefault())
        .map(() => $('#message-box').val())
        .do(() => $('#message-box').val(''))
        .subscribe(message => socket.emit('chat message', message));

    // Listen for messages and attach to DOM
    message$
        .subscribe(message => {
            $('#messages').append($('<li>').text(message));
            window.scrollTo(0, document.body.scrollHeight);
        });
});