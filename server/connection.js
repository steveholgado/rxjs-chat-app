const { of, fromEvent } = require('rxjs')
const { map, switchMap, mergeMap, takeUntil } = require('rxjs/operators')
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

// On connection, listen for event
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

module.exports = {
  connection$,
  disconnect$,
  listenOnConnect
}
