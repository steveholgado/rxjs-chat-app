import Rx from 'rxjs'
import $ from 'jquery'

// Clicks on 'Send' button
const sendButtonClick$ = Rx.Observable
  .fromEvent($('.send-btn'), 'click')

// Enter key presses in message input field
const enterKeyPress$ = Rx.Observable
  .fromEvent($('.message-input'), 'keypress')
  .filter(e => e.keyCode === 13 || e.which === 13)

// Message message send stream
const sendMessage$ = Rx.Observable
  .merge(sendButtonClick$, enterKeyPress$)
  .map(() => $('.message-input').val())
  .filter(message => message)
  .do(() => $('.message-input').val(''))

// Changes to user-select drop-down
const userSelectChange$ = Rx.Observable
  .fromEvent($('.user-select'), 'change')
  .map(e => e.target.value)
  .startWith('everyone')

// Message stream
const submitAction$ = sendMessage$
  .withLatestFrom(userSelectChange$)
  .map(([ message, socketId ]) => ({ message, socketId }))

export default submitAction$
