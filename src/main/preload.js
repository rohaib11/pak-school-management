console.log('✅ preload.js has been loaded and executed');
const { contextBridge, ipcRenderer } = require('electron')

// ✅ Define allowed channels
const validSendChannels = ['students:add', 'students:delete']
const validReceiveChannels = ['students:updated', 'students:list:response']
const validInvokeChannels = [
  // Students
  'students:list', 'students:getById', 'students:update', 'students:add', 'students:delete',

  // Auth
  'auth:signup', 'auth:login',

  // Teachers
  'teachers:list', 'teachers:getById', 'teachers:add', 'teachers:update', 'teachers:delete',

  // Categories
  'categories:list', 'categories:add', 'categories:update', 'categories:delete',

  // Fees
  'feeAssignments:list', 'feeAssignments:add', 'feeAssignments:delete',

  // Users
  'users:list', 'users:update-role', 'users:delete',

  // Subjects
  'subjects:list',
  'subjects:get',        // ✅ Add this
  'subjects:create',
  'subjects:update',
  'subjects:delete',
  'subjects:bulk-delete',
  'subjects:assignments',

  // Classes
  'classes:list',
  'classes:create',
  'classes:get',
  'classes:add',
  'classes:update',
  'classes:delete',
  'classes:bulk-delete',
];



contextBridge.exposeInMainWorld('electronAPI', {
  send: (channel, data) => {
    if (validSendChannels.includes(channel)) {
      ipcRenderer.send(channel, data)
    } else {
      console.warn(`❌ Blocked attempt to send on invalid channel: ${channel}`)
    }
  },
  receive: (channel, func) => {
    if (validReceiveChannels.includes(channel)) {
      const listener = (event, ...args) => func(...args)
      ipcRenderer.on(channel, listener)

      // 🔁 Return a function to remove listener if needed
      return () => ipcRenderer.removeListener(channel, listener)
    } else {
      console.warn(`❌ Blocked attempt to receive on invalid channel: ${channel}`)
    }
  },
  invoke: (channel, data) => {
    if (validInvokeChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, data)
    } else {
      console.warn(`❌ Blocked attempt to invoke invalid channel: ${channel}`)
    }
  }
})
