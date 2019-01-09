import { of, fromEvent } from 'rxjs'
import { map, mapTo, switchMap } from 'rxjs/operators'
import io from 'socket.io-client'

// Initialise Socket.IO and wrap in observable
const socket$ = of(io())

// Stream of connections
const connect$ = socket$
  .pipe(
    switchMap(socket =>
      fromEvent(socket, 'connect')
        .pipe(
          mapTo(socket)
        )
    )
  )

// On connection, listen for event
export const listenOnConnect = (event) =>
  connect$
    .pipe(
      switchMap(socket =>
        fromEvent(socket, event)
      )
    )

// On connection, emit data from observable
export const emitOnConnect = (observable) =>
  connect$
    .pipe(
      switchMap(socket =>
        observable
          .pipe(
            map(data => ({ socket, data }))
          )
      )
    )
