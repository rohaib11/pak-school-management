const { ipcMain } = require('electron')
const { createUser, loginUser } = require('../db/userModel')


function registerAuthHandlers(ipc) {
  // Handle user registration
  ipc.handle('auth:signup', (event, userData) => {
    try {
      const result = createUser(userData)
      return { success: true, userId: result.lastInsertRowid }
    } catch (err) {
      console.error('Signup failed:', err.message)
      return { success: false, error: err.message }
    }
  })

  // Handle user login
  // Handle user login
  ipc.handle('auth:login', (event, credentials) => {
    try {
      console.log('🟡 Login credentials received:', credentials)  // ✅ Add this line

      const user = loginUser(credentials)
      if (user) {
        return { success: true, user }
      } else {
        return { success: false, error: 'Invalid email or password' }
      }
    } catch (err) {
      console.error('❌ Login failed:', err.message)
      return { success: false, error: err.message }
    }
  })

}

module.exports = { registerAuthHandlers }
