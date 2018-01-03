import $ from 'jquery'

export const requestUsername = () => {
  let username = prompt('Please enter a username', '')

  // If no username, generate random
  if (!username) {
    const randomNum = Math.floor(Math.random() * 1000)
    username = 'user' + randomNum
  }

  return username
}

export const addMessage = (username, message) => {
  const element = $('<li>').text(username + ': ' + message)
  $('#messages').append(element)
  window.scrollTo(0, document.body.scrollHeight)
}

export const addUser = (id, username, clear) => {
  if (clear) {
    $('#users').html('')
  }
  const element = $('<option>').val(id).text(username)
  $('#users').append(element)
}

export const removeUser = (id) => {
  $('#users option[value=' + id + ']').remove()
}
