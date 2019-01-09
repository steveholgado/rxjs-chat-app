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
  document.querySelector('.messages')
    .insertAdjacentHTML(
      'beforeend',
      `<li><span>${username}: </span>${message}</li>`
    )
  
  window.scrollTo(0, document.body.scrollHeight)
}

export const addUser = (id, username) => {
  document.querySelector('.users')
    .insertAdjacentHTML(
      'beforeend',
      `<option value=${id}>${username}</option>`
    )
}

export const clearUsers = () => {
  document.querySelector('.users').innerHTML = ''
}

export const removeUser = (id) => {
  const optionToRemove = document.querySelector(`.users option[value="${id}"]`)
  if (optionToRemove) {
    optionToRemove.parentNode.removeChild(optionToRemove)
  }
}
