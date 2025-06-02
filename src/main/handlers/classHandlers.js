const { nanoid } = require('nanoid');
const db = require('../db');

function registerClassHandlers(ipcMain) {
  // ✅ List all classes
  ipcMain.handle('classes:list', () => {
    const stmt = db.prepare(`
      SELECT 
        c.*, 
        t.name as teacherName 
      FROM classes c 
      LEFT JOIN teachers t ON c.teacherId = t.id 
      ORDER BY c.createdAt DESC
    `);
    return stmt.all();
  });

  // ✅ Get a single class with subject assignments
  ipcMain.handle('classes:get', (event, id) => {
    const cls = db.prepare(`SELECT * FROM classes WHERE id = ?`).get(id);
    if (!cls) return null;

    const assignments = db.prepare(`
      SELECT 
        a.*, 
        s.name AS subjectName, 
        t.name AS teacherName 
      FROM class_subject_assignments a
      JOIN subjects s ON a.subjectId = s.id
      LEFT JOIN teachers t ON a.teacherId = t.id
      WHERE a.classId = ?
    `).all(id);

    return {
      ...cls,
      subjectAssignments: assignments.map(a => ({
        subjectId: a.subjectId,
        teacherId: a.teacherId,
        subjectName: a.subjectName,
        teacherName: a.teacherName
      }))
    };
  });

  // ✅ Create a new class
  ipcMain.handle('classes:create', (event, data) => {
    const id = nanoid();

    const insert = db.prepare(`
      INSERT INTO classes (
        id, name, section, grade, roomNumber, capacity, status, description, teacherId, currentStudents, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);
    insert.run(
      id,
      data.name,
      data.section,
      data.grade,
      data.roomNumber,
      data.capacity,
      data.status || 'active',
      data.description || '',
      data.teacherId || null,
      data.currentStudents || 0
    );

    const assign = db.prepare(`
      INSERT INTO class_subject_assignments (
        id, classId, subjectId, teacherId, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
    `);

    for (const assignment of data.subjectAssignments || []) {
      assign.run(nanoid(), id, assignment.subjectId, assignment.teacherId || null);
    }

    return { success: true, id };
  });

  // ✅ Update existing class
  ipcMain.handle('classes:update', (event, data) => {
    const update = db.prepare(`
      UPDATE classes
      SET name = ?, section = ?, grade = ?, roomNumber = ?, capacity = ?, status = ?, description = ?, teacherId = ?, currentStudents = ?, updatedAt = datetime('now')
      WHERE id = ?
    `);
    update.run(
      data.name,
      data.section,
      data.grade,
      data.roomNumber,
      data.capacity,
      data.status || 'active',
      data.description || '',
      data.teacherId || null,
      data.currentStudents || 0,
      data.id
    );

    db.prepare(`DELETE FROM class_subject_assignments WHERE classId = ?`).run(data.id);

    const assign = db.prepare(`
      INSERT INTO class_subject_assignments (
        id, classId, subjectId, teacherId, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
    `);
    for (const assignment of data.subjectAssignments || []) {
      assign.run(nanoid(), data.id, assignment.subjectId, assignment.teacherId || null);
    }

    return { success: true };
  });

  // ✅ Delete a class
  ipcMain.handle('classes:delete', (event, id) => {
    db.prepare(`DELETE FROM class_subject_assignments WHERE classId = ?`).run(id);
    db.prepare(`DELETE FROM classes WHERE id = ?`).run(id);
    return { success: true };
  });

  // ✅ Bulk delete classes
  ipcMain.handle('classes:bulk-delete', (event, ids = []) => {
    const deleteAssignments = db.prepare(`DELETE FROM class_subject_assignments WHERE classId = ?`);
    const deleteClasses = db.prepare(`DELETE FROM classes WHERE id = ?`);

    const transaction = db.transaction(() => {
      for (const id of ids) {
        deleteAssignments.run(id);
        deleteClasses.run(id);
      }
    });

    transaction();
    return { success: true, deleted: ids.length };
  });
}

module.exports = { registerClassHandlers };
