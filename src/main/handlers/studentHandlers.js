const fs = require('fs');
const path = require('path');
const { app } = require('electron');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

const getUploadsDir = () => {
  const userDataPath = app.getPath('userData');
  const uploadPath = path.join(userDataPath, 'uploads', 'students');
  fs.mkdirSync(uploadPath, { recursive: true });
  return uploadPath;
};

function registerStudentHandlers(ipcMain) {
  // ✅ students:add
  ipcMain.handle('students:add', async (event, { student, photoBuffer, photoName, documentBuffers }) => {
    console.log('✅ IPC handler triggered: students:add');
    const uploadsDir = getUploadsDir();

    let photoPath = null;
    if (photoBuffer && photoName) {
      const uniquePhotoName = `${uuidv4()}-${photoName}`;
      photoPath = path.join(uploadsDir, uniquePhotoName);
      fs.writeFileSync(photoPath, Buffer.from(photoBuffer));
    }

    const admissionDate = new Date().toISOString().split('T')[0];
    const currentYear = new Date().getFullYear();
    const academicYear = `${currentYear}-${currentYear + 1}`;

    const insertStudent = db.prepare(`
      INSERT INTO students (
        id, admissionNo, name, fatherName, fatherPhone,
        rollNumber, classId, section, gender, dob, phone, address, status,
        photoPath, admissionDate, academicYear
      ) 
      VALUES (
        ?, ?, ?, ?, ?, 
        ?, ?, ?, ?, ?, 
        ?, ?, ?, ?, ?, ?
      )
    `);

    const studentId = uuidv4();
    insertStudent.run(
      studentId,
      student.admissionNo,
      student.name,
      student.fatherName,
      student.fatherPhone,
      student.rollNumber,
      student.classId,
      student.section,
      student.gender,
      student.dob,
      student.phone,
      student.address,
      student.status,
      photoPath,
      admissionDate,
      academicYear
    );

    if (Array.isArray(documentBuffers)) {
      const insertDoc = db.prepare(`
        INSERT INTO documents (id, studentId, name, type, filePath)
        VALUES (?, ?, ?, ?, ?)
      `);

      for (const doc of documentBuffers) {
        const uniqueDocName = `${uuidv4()}-${doc.name}`;
        const filePath = path.join(uploadsDir, uniqueDocName);
        fs.writeFileSync(filePath, Buffer.from(doc.buffer));
        insertDoc.run(uuidv4(), studentId, doc.name, doc.type, filePath);
      }
    }

    return { success: true, id: studentId };
  });

  ipcMain.handle('students:list', async () => {
    try {
      const stmt = db.prepare('SELECT * FROM students');
      return stmt.all();
    } catch (err) {
      console.error('❌ Failed to fetch students:', err);
      return [];
    }
  });

  ipcMain.handle('students:getById', async (event, id) => {
    try {
      const studentStmt = db.prepare('SELECT * FROM students WHERE id = ?');
      const student = studentStmt.get(id);

      if (!student) return null;

      const docStmt = db.prepare('SELECT * FROM documents WHERE studentId = ?');
      const documents = docStmt.all(id);

      return {
        ...student,
        photo: student.photoPath ? `file://${student.photoPath}` : null,
        documents,
      };
    } catch (err) {
      console.error('❌ Failed to fetch student by ID:', err);
      return null;
    }
  });

  ipcMain.handle('students:update', async (event, { id, student, photoBuffer, photoName, documentBuffers }) => {
    try {
      const uploadsDir = getUploadsDir();
      const exists = db.prepare('SELECT photoPath FROM students WHERE id = ?').get(id);
      if (!exists) {
        return { success: false, error: 'Student not found' };
      }

      let photoPath = null;
      if (photoBuffer && photoName) {
        if (exists.photoPath && fs.existsSync(exists.photoPath)) {
          fs.unlinkSync(exists.photoPath);
        }

        const uniquePhotoName = `${uuidv4()}-${photoName}`;
        photoPath = path.join(uploadsDir, uniquePhotoName);
        fs.writeFileSync(photoPath, Buffer.from(photoBuffer));
      }

      let query = `
        UPDATE students SET
          admissionNo = ?,
          name = ?,
          fatherName = ?,
          fatherPhone = ?,
          rollNumber = ?,
          classId = ?,
          section = ?,
          gender = ?,
          dob = ?,
          phone = ?,
          address = ?,
          status = ?
      `;
      const updateParams = [
        student.admissionNo,
        student.name,
        student.fatherName,
        student.fatherPhone,
        student.rollNumber,
        student.classId,
        student.section,
        student.gender,
        student.dob,
        student.phone,
        student.address,
        student.status,
      ];

      if (photoPath) {
        query += `, photoPath = ?`;
        updateParams.push(photoPath);
      }

      query += `, updatedAt = datetime('now') WHERE id = ?`;
      updateParams.push(id);

      const updateStmt = db.prepare(query);
      updateStmt.run(...updateParams);

      if (Array.isArray(documentBuffers) && documentBuffers.length > 0) {
        const oldDocs = db.prepare('SELECT filePath FROM documents WHERE studentId = ?').all(id);
        oldDocs.forEach(doc => {
          if (fs.existsSync(doc.filePath)) fs.unlinkSync(doc.filePath);
        });
        db.prepare('DELETE FROM documents WHERE studentId = ?').run(id);

        const insertDoc = db.prepare(`
          INSERT INTO documents (id, studentId, name, type, filePath)
          VALUES (?, ?, ?, ?, ?)
        `);

        for (const doc of documentBuffers) {
          const uniqueDocName = `${uuidv4()}-${doc.name}`;
          const filePath = path.join(uploadsDir, uniqueDocName);
          fs.writeFileSync(filePath, Buffer.from(doc.buffer));
          insertDoc.run(uuidv4(), id, doc.name, doc.type, filePath);
        }
      }

      const updatedStudent = db.prepare('SELECT * FROM students WHERE id = ?').get(id);
      return { success: true, student: updatedStudent };
    } catch (err) {
      console.error('❌ Failed to update student:', err);
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('students:delete', async (event, id) => {
    try {
      const student = db.prepare('SELECT photoPath FROM students WHERE id = ?').get(id);
      if (!student) {
        return { success: false, error: 'Student not found' };
      }

      if (student.photoPath && fs.existsSync(student.photoPath)) {
        fs.unlinkSync(student.photoPath);
      }

      const docs = db.prepare('SELECT filePath FROM documents WHERE studentId = ?').all(id);
      docs.forEach(doc => {
        if (fs.existsSync(doc.filePath)) {
          fs.unlinkSync(doc.filePath);
        }
      });

      db.prepare('DELETE FROM documents WHERE studentId = ?').run(id);
      db.prepare('DELETE FROM students WHERE id = ?').run(id);

      return { success: true };
    } catch (err) {
      console.error('❌ Failed to delete student:', err);
      return { success: false, error: err.message };
    }
  });
}

module.exports = { registerStudentHandlers };
