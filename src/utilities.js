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
  const elementUsername = $('<span>').text(username + ': ')
  const elementListItem = $('<li>').append(elementUsername).append(message)
  $('.message-list').append(elementListItem)
  
  window.scrollTo(0, document.body.scrollHeight)
}

export const addUser = (id, username, clear) => {
  if (clear) {
    $('.user-select').html('')
  }

  const elementOption = $('<option>').val(id).text(username)
  $('.user-select').append(elementOption)
}

export const removeUser = (id) => {
  $('.user-select option[value=' + id + ']').remove()
}
