const { contextBridge, ipcRenderer } = require('electron');

// ✅ Platform info
contextBridge.exposeInMainWorld('electron', {
  platform: process.platform,
  versions: {
    node:     process.versions.node,
    chrome:   process.versions.chrome,
    electron: process.versions.electron,
  },
});

// ✅ App APIs — all in one clean object
contextBridge.exposeInMainWorld('electronAPI', {
  // Judge0 code execution
  executeCode: (code, language, stdin) =>
    ipcRenderer.invoke('execute-code', { code, language, stdin }),

  // ✅ Clipboard — fallback for when navigator.clipboard is blocked
  clipboardWrite: (text) =>
    ipcRenderer.invoke('clipboard-write', text),

  // ✅ Screen share sources
  getScreenSources: () =>
    ipcRenderer.invoke('get-screen-sources'),

  // Electron check
  isElectron: () => true,
});

console.log('✅ Preload script loaded with code execution API');