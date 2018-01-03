// Get all users from sockets
const getAllUsers = (allSockets) => {
  return Object.keys(allSockets)
    .filter(key => allSockets[key].username)
    .map(key => ({
      id: key,
      username: allSockets[key].username
    }))
}

module.exports = { getAllUsers }
