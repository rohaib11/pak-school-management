const db = require('../db');
const { v4: uuidv4 } = require('uuid');

function registerFeeAssignmentHandlers(ipcMain) {
  // 🔹 Add Fee Assignment
  ipcMain.handle('feeAssignments:add', (event, assignment) => {
    try {
  const stmt = db.prepare(`
  INSERT INTO fee_assignments (
    id, categoryId, studentId, classId, groupTag,
    amount, dueDate, isRecurring, recurrenceType,
    discountType, discountValue, notes, installments,
    createdAt
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
`);

let insertedIds = [];

if (assignment.studentIds && Array.isArray(assignment.studentIds)) {
  for (const studentId of assignment.studentIds) {
    const id = uuidv4();
    stmt.run(
      id,
      assignment.categoryId,
      studentId,
      null,
      null,
      assignment.amount,
      assignment.dueDate,
      assignment.isRecurring || 0,
      assignment.recurrenceType || null,
      assignment.discountType || null,
      assignment.discountValue || null,
      assignment.notes || null,
      assignment.installments || 1
    );
    insertedIds.push(id);
  }
} else {
  const id = uuidv4();
  stmt.run(
    id,
    assignment.categoryId,
    null,
    assignment.classId || null,
    assignment.groupTag || null,
    assignment.amount,
    assignment.dueDate,
    assignment.isRecurring || 0,
    assignment.recurrenceType || null,
    assignment.discountType || null,
    assignment.discountValue || null,
    assignment.notes || null,
    assignment.installments || 1
  );
  insertedIds.push(id);
}

return { success: true, ids: insertedIds };

    } catch (err) {
      console.error('❌ Error assigning fee:', err);
      return { success: false, error: err.message };
    }
  });

  // 🔹 List Fee Assignments
  ipcMain.handle('feeAssignments:list', () => {
    try {
      const stmt = db.prepare(`
        SELECT fa.*, fc.name AS categoryName
        FROM fee_assignments fa
        JOIN fee_categories fc ON fa.categoryId = fc.id
        ORDER BY fa.createdAt DESC
      `);
      return stmt.all();
    } catch (err) {
      console.error('❌ Error fetching fee assignments:', err);
      return [];
    }
  });

  // 🔹 Delete Fee Assignment
  ipcMain.handle('feeAssignments:delete', (event, id) => {
    try {
      const stmt = db.prepare(`DELETE FROM fee_assignments WHERE id = ?`);
      stmt.run(id);
      return { success: true };
    } catch (err) {
      console.error('❌ Error deleting fee assignment:', err);
      return { success: false, error: err.message };
    }
  });
}

module.exports = { registerFeeAssignmentHandlers };
