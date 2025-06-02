const { ipcMain } = require('electron');
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

function registerSubjectHandlers(ipcMain) {
  // List all subjects with class and teacher assignments
  ipcMain.handle('subjects:list', () => {
    const subjects = db.prepare('SELECT * FROM subjects').all();

    const assignments = db.prepare(`
      SELECT csa.subjectId, csa.classId, csa.teacherId, 
             classes.name as className, teachers.name as teacherName
      FROM class_subject_assignments csa
      LEFT JOIN classes ON classes.id = csa.classId
      LEFT JOIN teachers ON teachers.id = csa.teacherId
    `).all();

    const grouped = subjects.map(subject => {
      const classAssignments = assignments.filter(a => a.subjectId === subject.id);
      return {
        ...subject,
        classes: classAssignments.map(a => ({
          id: a.classId,
          name: a.className,
          teacher: a.teacherName
        })),
        teachers: [...new Set(classAssignments.map(a => a.teacherId).filter(Boolean))]
      };
    });

    return grouped;
  });

  // Get subject by ID
  ipcMain.handle('subjects:get', (event, id) => {
    const subject = db.prepare('SELECT * FROM subjects WHERE id = ?').get(id);
    if (!subject) return null;

    const assignments = db.prepare(`
      SELECT classId, teacherId FROM class_subject_assignments
      WHERE subjectId = ?
    `).all(id);

    return {
      ...subject,
      assignments
    };
  });

  // Get assignments for a subject
  ipcMain.handle('subjects:assignments', (event, subjectId) => {
    return db.prepare('SELECT * FROM class_subject_assignments WHERE subjectId = ?').all(subjectId);
  });

  // Create new subject
  ipcMain.handle('subjects:create', (event, data) => {
    const subjectId = uuidv4();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO subjects (id, name, description, status, createdAt)
      VALUES (?, ?, ?, ?, ?)
    `).run(subjectId, data.name, data.description, data.status, now);

    const insertAssignment = db.prepare(`
      INSERT INTO class_subject_assignments (id, classId, subjectId, teacherId, createdAt)
      VALUES (?, ?, ?, ?, ?)
    `);

    for (const assignment of data.assignments) {
      insertAssignment.run(uuidv4(), assignment.classId, subjectId, assignment.teacherId || null, now);
    }

    return { success: true, id: subjectId };
  });

  // Update subject
  ipcMain.handle('subjects:update', (event, { id, name, description, status, assignments }) => {
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE subjects SET name = ?, description = ?, status = ?, updatedAt = ?
      WHERE id = ?
    `).run(name, description, status, now, id);

    db.prepare('DELETE FROM class_subject_assignments WHERE subjectId = ?').run(id);

    const insert = db.prepare(`
      INSERT INTO class_subject_assignments (id, classId, subjectId, teacherId, createdAt)
      VALUES (?, ?, ?, ?, ?)
    `);

    for (const ass of assignments) {
      insert.run(uuidv4(), ass.classId, id, ass.teacherId || null, now);
    }

    return { success: true };
  });

  // Delete a subject
  ipcMain.handle('subjects:delete', (event, id) => {
    db.prepare('DELETE FROM class_subject_assignments WHERE subjectId = ?').run(id);
    db.prepare('DELETE FROM subjects WHERE id = ?').run(id);
    return { success: true };
  });

  // Bulk delete subjects
  ipcMain.handle('subjects:bulk-delete', (event, ids) => {
    const delAssignments = db.prepare('DELETE FROM class_subject_assignments WHERE subjectId = ?');
    const delSubjects = db.prepare('DELETE FROM subjects WHERE id = ?');

    for (const id of ids) {
      delAssignments.run(id);
      delSubjects.run(id);
    }

    return { success: true, count: ids.length };
  });
}

module.exports = { registerSubjectHandlers };
