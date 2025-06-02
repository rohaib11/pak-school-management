const db = require('../db');

function registerUserHandlers(ipcMain) {
  // 📌 Get all users
  ipcMain.handle('users:list', () => {
    const stmt = db.prepare(`SELECT id, name, email, role, avatar FROM users`);
    return stmt.all();
  });

  // 📌 Update user role
  ipcMain.handle('users:update-role', (event, { userId, role }) => {
    const stmt = db.prepare(`UPDATE users SET role = ? WHERE id = ?`);
    const result = stmt.run(role, userId);
    return { updated: result.changes > 0 };
  });

  ipcMain.handle('users:delete', (event, { userId }) => {
  const stmt = db.prepare(`DELETE FROM users WHERE id = ?`);
  const result = stmt.run(userId);
  return { success: result.changes > 0 };
});

}

module.exports = { registerUserHandlers };
