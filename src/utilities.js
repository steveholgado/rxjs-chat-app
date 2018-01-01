import $ from 'jquery'

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
