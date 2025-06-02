
const { app } = require('electron');
const db = require('../db');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

function registerTeacherHandlers(ipcMain) {
  ipcMain.handle('teachers:add', async (event, { teacher, photoBuffer, photoName, documentBuffers }) => {
    try {
      const id = uuidv4();
      const now = new Date().toISOString();

      let photoPath = null;
      if (photoBuffer && photoName) {
        const photoDir = path.join(app.getPath('userData'), 'photos', 'teachers');
        fs.mkdirSync(photoDir, { recursive: true });
        photoPath = path.join(photoDir, id + '_' + photoName);
        fs.writeFileSync(photoPath, Buffer.from(photoBuffer));
      }

      db.prepare(`
        INSERT INTO teachers (
          id, name, email, phone, gender, dob, subject,
          qualification, experience, address, city, joiningDate,
          status, salary, cnic, emergencyContact, photoPath, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id, teacher.name, teacher.email, teacher.phone, teacher.gender, teacher.dob,
        teacher.subject, teacher.qualification, teacher.experience, teacher.address,
        teacher.city, teacher.joiningDate, teacher.status, teacher.salary,
        teacher.cnic, teacher.emergencyContact, photoPath, now
      );

      return { success: true, id };
    } catch (err) {
      console.error('❌ Failed to add teacher:', err);
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('teachers:list', () => {
    try {
      const stmt = db.prepare('SELECT * FROM teachers ORDER BY createdAt DESC');
      return stmt.all();
    } catch (err) {
      console.error('❌ Failed to list teachers:', err);
      return [];
    }
  });

  ipcMain.handle('teachers:getById', (event, id) => {
    try {
      const stmt = db.prepare('SELECT * FROM teachers WHERE id = ?');
      return stmt.get(id);
    } catch (err) {
      console.error('❌ Failed to get teacher by ID:', err);
      return null;
    }
  });

  ipcMain.handle('teachers:update', async (event, { id, teacher, photoBuffer, photoName }) => {
    try {
      const now = new Date().toISOString();

      let photoPath = null;
      if (photoBuffer && photoName) {
        const photoDir = path.join(app.getPath('userData'), 'photos', 'teachers');
        fs.mkdirSync(photoDir, { recursive: true });
        photoPath = path.join(photoDir, id + '_' + photoName);
        fs.writeFileSync(photoPath, Buffer.from(photoBuffer));
      }

      const existing = db.prepare('SELECT * FROM teachers WHERE id = ?').get(id);
      if (!existing) return { success: false, error: 'Teacher not found' };

      db.prepare(`
        UPDATE teachers SET
          name = ?, email = ?, phone = ?, gender = ?, dob = ?,
          subject = ?, qualification = ?, experience = ?, address = ?, city = ?,
          joiningDate = ?, status = ?, salary = ?, cnic = ?, emergencyContact = ?,
          photoPath = COALESCE(?, photoPath),
          updatedAt = ?
        WHERE id = ?
      `).run(
        teacher.name, teacher.email, teacher.phone, teacher.gender, teacher.dob,
        teacher.subject, teacher.qualification, teacher.experience, teacher.address,
        teacher.city, teacher.joiningDate, teacher.status, teacher.salary,
        teacher.cnic, teacher.emergencyContact, photoPath, now, id
      );

      return { success: true };
    } catch (err) {
      console.error('❌ Failed to update teacher:', err);
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('teachers:delete', (event, id) => {
    try {
      const stmt = db.prepare('DELETE FROM teachers WHERE id = ?');
      stmt.run(id);
      return { success: true };
    } catch (err) {
      console.error('❌ Failed to delete teacher:', err);
      return { success: false, error: err.message };
    }
  });
}

module.exports = { registerTeacherHandlers };
