const { app } = require('electron');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Path to the database file
const dbPath = path.join(app.getPath('userData'), 'data', 'school.db');

// Ensure the directory exists
const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

let db;

try {
  db = new Database(dbPath);

  // === Users Table ===
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'staff',
      avatar TEXT,
      linkedId TEXT
    )
  `);

  // === Students Table ===
  db.exec(`
    CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      admissionNo TEXT NOT NULL,
      name TEXT NOT NULL,
      fatherName TEXT NOT NULL,
      fatherPhone TEXT NOT NULL,
      rollNumber TEXT NOT NULL,
      classId TEXT,
      section TEXT NOT NULL,
      gender TEXT NOT NULL,
      dob TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      status TEXT NOT NULL,
      photoPath TEXT,
      admissionDate TEXT,
      academicYear TEXT,
      updatedAt TEXT,
      FOREIGN KEY (classId) REFERENCES classes(id)
    )
  `);

  // === Documents Table ===
  db.exec(`
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      filePath TEXT NOT NULL,
      FOREIGN KEY(studentId) REFERENCES students(id)
    )
  `);

  // === Teachers Table ===
  db.exec(`
    CREATE TABLE IF NOT EXISTS teachers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT NOT NULL,
      subject TEXT NOT NULL,
      gender TEXT NOT NULL,
      dob TEXT,
      address TEXT,
      city TEXT,
      joiningDate TEXT,
      qualification TEXT,
      experience INTEGER,
      status TEXT DEFAULT 'active',
      salary REAL,
      cnic TEXT,
      emergencyContact TEXT,
      photoPath TEXT,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT,
      bankName TEXT,
      accountNumber TEXT
    )
  `);

  // === Classes Table ===
  db.exec(`
    CREATE TABLE IF NOT EXISTS classes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      grade TEXT NOT NULL,
      section TEXT,
      roomNumber TEXT,
      capacity INTEGER DEFAULT 30,
      currentStudents INTEGER DEFAULT 0,
      teacherId TEXT,
      status TEXT DEFAULT 'active',
      description TEXT,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT,
      FOREIGN KEY(teacherId) REFERENCES teachers(id)
    )
  `);

  // === Subjects Table ===
  db.exec(`
    CREATE TABLE IF NOT EXISTS subjects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      status TEXT DEFAULT 'active',
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT
    )
  `);

  // === Class-Subject-Teacher Assignments ===
  db.exec(`
    CREATE TABLE IF NOT EXISTS class_subject_assignments (
      id TEXT PRIMARY KEY,
      classId TEXT NOT NULL,
      subjectId TEXT NOT NULL,
      teacherId TEXT,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT,
      FOREIGN KEY(classId) REFERENCES classes(id),
      FOREIGN KEY(subjectId) REFERENCES subjects(id),
      FOREIGN KEY(teacherId) REFERENCES teachers(id)
    )
  `);

  // === Fee Category ===
  db.exec(`
    CREATE TABLE IF NOT EXISTS fee_categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      defaultAmount REAL NOT NULL,
      isRecurringDefault INTEGER NOT NULL CHECK (isRecurringDefault IN (0, 1)),
      description TEXT,
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT
    )
  `);

  // === Fee Assignments ===
  db.exec(`
    CREATE TABLE IF NOT EXISTS fee_assignments (
      id TEXT PRIMARY KEY,
      categoryId TEXT NOT NULL,
      studentId TEXT,
      classId TEXT,
      groupTag TEXT,
      amount REAL NOT NULL,
      dueDate TEXT NOT NULL,
      isRecurring INTEGER NOT NULL DEFAULT 0,
      recurrenceType TEXT,
      discountType TEXT,
      discountValue REAL,
      notes TEXT,
      installments INTEGER DEFAULT 1,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT,
      FOREIGN KEY (categoryId) REFERENCES fee_categories(id),
      FOREIGN KEY (studentId) REFERENCES students(id),
      FOREIGN KEY (classId) REFERENCES classes(id)
    )
  `);

  // === Default Admin User ===
  const check = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (check.count === 0) {
    db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)')
      .run('Admin', 'admin@school.com', 'admin123', 'admin');
    console.log('✅ Default admin user created.');
  }

} catch (error) {
  console.error('❌ Error initializing the database:', error.message);
  process.exit(1);
}

module.exports = db;
