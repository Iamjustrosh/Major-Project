// Preload script (CommonJS version)
const { contextBridge, ipcRenderer } = require('electron');

// ✅ Your existing code (KEEP THIS)
contextBridge.exposeInMainWorld('electron', {
  platform: process.platform,
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron,
  },
});

// ✅ NEW: Code execution API (ADD THIS)
contextBridge.exposeInMainWorld('electronAPI', {
  /**
   * Execute code using Electron's main process (bypasses CORS!)
   */
  executeCode: (code, language, stdin) => {
    return ipcRenderer.invoke('execute-code', { code, language, stdin });
  },

  /**
   * Check if running in Electron
   */
  isElectron: () => true,
});

console.log('✅ Preload script loaded with code execution API');