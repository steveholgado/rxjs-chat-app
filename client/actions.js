import { fromEvent, merge } from 'rxjs'
import { map, filter, startWith, withLatestFrom } from 'rxjs/operators'

// DOM elements
const sendButton = document.querySelector('.send')
const inputBox = document.querySelector('.input')
const userSelect = document.querySelector('.users')

// Clicks on 'Send' button
const sendButtonClick$ = fromEvent(sendButton, 'click')

// Enter key presses in message input field
const enterKeyPress$ = fromEvent(inputBox, 'keypress')
  .pipe(
    filter(e => e.keyCode === 13) // "Enter" key
  )

// Changes to user-select drop-down
const userSelectChange$ = fromEvent(userSelect, 'change')
  .pipe(
    map(e => e.target.value),
    startWith('everyone')
  )

// Message send stream
const sendMessage$ = merge(sendButtonClick$, enterKeyPress$)
  .pipe(
    map(() => inputBox.value),
    filter(message => message),
    withLatestFrom(userSelectChange$)
  )

export default sendMessage$
