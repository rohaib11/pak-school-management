const db = require('../db');
const { v4: uuidv4 } = require('uuid');

function registerCategoryHandlers(ipcMain) {
  // 🔹 List all categories
  ipcMain.handle('categories:list', () => {
    try {
      const stmt = db.prepare(`SELECT * FROM fee_categories ORDER BY createdAt DESC`);
      return stmt.all();
    } catch (err) {
      console.error('❌ Error fetching categories:', err);
      return [];
    }
  });

  // 🔹 Add new category
  ipcMain.handle('categories:add', (event, category) => {
    try {
      const stmt = db.prepare(`
        INSERT INTO fee_categories (
          id, name, defaultAmount, isRecurringDefault, description, status, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      `);
      const id = uuidv4();
      stmt.run(
        id,
        category.name,
        category.defaultAmount,
        category.isRecurringDefault ? 1 : 0,
        category.description,
        category.status || 'active'
      );
      return { success: true, id };
    } catch (err) {
      console.error('❌ Error adding category:', err);
      return { success: false, error: err.message };
    }
  });

  // 🔹 Update category
  ipcMain.handle('categories:update', (event, category) => {
    try {
      const stmt = db.prepare(`
        UPDATE fee_categories SET 
          name = ?, 
          defaultAmount = ?, 
          isRecurringDefault = ?, 
          description = ?, 
          status = ?, 
          updatedAt = datetime('now')
        WHERE id = ?
      `);
      stmt.run(
        category.name,
        category.defaultAmount,
        category.isRecurringDefault ? 1 : 0,
        category.description,
        category.status,
        category.id
      );
      return { success: true };
    } catch (err) {
      console.error('❌ Error updating category:', err);
      return { success: false, error: err.message };
    }
  });

  // 🔹 Delete category
  ipcMain.handle('categories:delete', (event, id) => {
    try {
      const stmt = db.prepare(`DELETE FROM fee_categories WHERE id = ?`);
      stmt.run(id);
      return { success: true };
    } catch (err) {
      console.error('❌ Error deleting category:', err);
      return { success: false, error: err.message };
    }
  });
}

module.exports = { registerCategoryHandlers };
