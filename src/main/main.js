const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

// ✅ Environment flag
const isDev = process.env.NODE_ENV === 'development';

// ✅ Safe handler imports
const { registerStudentHandlers } = require(path.join(__dirname, 'handlers', 'studentHandlers'));
const { registerAuthHandlers } = require(path.join(__dirname, 'handlers', 'authHandlers'));
const { registerTeacherHandlers } = require(path.join(__dirname, 'handlers', 'teacherHandlers')); // ✅ NEW
const { registerCategoryHandlers } = require('./handlers/categoryHandlers'); // 👈 add this
const { registerFeeAssignmentHandlers } = require('./handlers/feeAssignmentHandlers');
const { registerUserHandlers } = require('./handlers/userHandlers');
const { registerSubjectHandlers } = require('./handlers/subjectHandlers');
const { registerClassHandlers } = require('./handlers/classHandlers');

// ✅ Chromium Cache Fix (MUST come before app.whenReady)
app.commandLine.appendSwitch(
  'disk-cache-dir',
  path.join(app.getPath('userData'), 'chrome-cache')
);


function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'Pak School Management System',
    icon: path.join(__dirname, '../../public/favicon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      devTools: true
    }
  });

  mainWindow.webContents.once('did-finish-load', () => {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173').catch(console.error);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/renderer/index.html')).catch(console.error);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  // ✅ Register IPC handlers safely
  try {
    registerStudentHandlers(ipcMain);
    registerAuthHandlers(ipcMain);
    registerTeacherHandlers(ipcMain); // ✅ Register teacher handlers
    registerCategoryHandlers(ipcMain); // 👈 inside app.whenReady
    registerFeeAssignmentHandlers(ipcMain); // 👈 Add this
    registerUserHandlers(ipcMain);
registerSubjectHandlers(ipcMain);
registerClassHandlers(ipcMain);

    console.log('✅ IPC handlers registered');
  } catch (err) {
    console.error('❌ Failed to register IPC handlers:', err);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ✅ Crash safety
process.on('uncaughtException', (err) => {
  console.error('❌ Unhandled exception:', err);
});
