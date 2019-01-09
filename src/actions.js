import { fromEvent, merge } from 'rxjs'
import { map, filter, tap, startWith, withLatestFrom } from 'rxjs/operators'

// Clicks on 'Send' button
const sendButtonClick$ = fromEvent(document.querySelector('.send'), 'click')

// Enter key presses in message input field
const enterKeyPress$ = fromEvent(document.querySelector('.input'), 'keypress')
  .pipe(
    filter(e => e.keyCode === 13 || e.which === 13)
  )

// Message message send stream
const sendMessage$ = merge(sendButtonClick$, enterKeyPress$)
  .pipe(
    map(() => document.querySelector('.input').value),
    filter(message => message),
    tap(() => document.querySelector('.input').value = '')
  )

// Changes to user-select drop-down
const userSelectChange$ = fromEvent(document.querySelector('.users'), 'change')
  .pipe(
    map(e => e.target.value),
    startWith('everyone')
  )

// Message stream
const submitAction$ = sendMessage$
  .pipe(
    withLatestFrom(userSelectChange$),
    map(([ message, id ]) => ({ message, id }))
  )

export default submitAction$
