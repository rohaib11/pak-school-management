const db = require('../db')

// ✅ Create user with optional role, avatar, and linkedId (e.g., teacherId/studentId)
function createUser({ name, email, password, role = 'staff', avatar = null, linkedId = null }) {
  const stmt = db.prepare(`
    INSERT INTO users (name, email, password, role, avatar, linkedId)
    VALUES (?, ?, ?, ?, ?, ?)
  `)
  return stmt.run(name, email, password, role, avatar, linkedId)
}

// ✅ Login user (include role & avatar)
function loginUser({ email, password }) {
  const stmt = db.prepare(`
    SELECT id, name, email, role, avatar, linkedId
    FROM users
    WHERE email = ? AND password = ?
  `)
  return stmt.get(email, password)
}

module.exports = {
  createUser,
  loginUser
}
