import Rx from 'rxjs'
import io from 'socket.io-client'

const socket$ = Rx.Observable.of(io())

const connection$ = socket$
  .switchMap(socket => {
    return Rx.Observable.fromEvent(socket, 'connect')
      .map(() => socket)
  })

const disconnect$ = socket$
  .switchMap(socket => {
    return Rx.Observable.fromEvent(socket, 'disconnect')
  })

// On connection, emit data from observable
const send = (observable, event) => {
  return connection$
    .mergeMap(socket => observable.map(data => ({ socket, data })))
    .takeUntil(disconnect$)
    .subscribe(({ socket, data }) => socket.emit(event, data))
}

// On connection, listen for event
const listen = (event) => {
  return connection$
    .mergeMap(socket => Rx.Observable.fromEvent(socket, event))
    .takeUntil(disconnect$)
}

export default { send, listen }
