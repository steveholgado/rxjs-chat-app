import Rx from 'rxjs'
import $ from 'jquery'

// Clicks on 'Send' button
const sendButtonClick$ = Rx.Observable
  .fromEvent($('.send-btn'), 'click')

// Enter key presses in message input field
const enterKeyPress$ = Rx.Observable
  .fromEvent($('.message-input'), 'keypress')
  .filter(e => e.keyCode === 13 || e.which === 13)

// Message stream
const submitAction$ = Rx.Observable
  .merge(sendButtonClick$, enterKeyPress$)
  .map(() => $('.message-input').val())
  .filter(message => message)
  .do(() => $('.message-input').val(''))

export default submitAction$
