import Rx from 'rxjs'
import io from 'socket.io-client'

const socket = io()

const connection$ = Rx.Observable.fromEvent(socket, 'connect')
const disconnect$ = Rx.Observable.fromEvent(socket, 'disconnect')

const send = (observable, event) => connection$
  .mergeMap(() => observable)
  .takeUntil(disconnect$)
  .subscribe(data => socket.emit(event, data))

const listen = (event) => connection$
  .mergeMap(() => Rx.Observable.fromEvent(socket, event))
  .takeUntil(disconnect$)

export default { send, listen }
