'use strict';
const { contextBridge, ipcRenderer } = require('electron');

// Only an explicit small bridge is exposed, never Node.js, filesystem or raw IPC.
contextBridge.exposeInMainWorld('cphAdmin', Object.freeze({
  status: () => ipcRenderer.invoke('cph-admin:status'),
  setup: (password, confirmation) => ipcRenderer.invoke('cph-admin:setup', { password, confirmation }),
  open: (password) => ipcRenderer.invoke('cph-admin:open', { password }),
}));
