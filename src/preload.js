// Preload script
import { contextBridge } from 'electron';

// Expose protected methods that allow the renderer process to use
// specific Node.js features safely
contextBridge.exposeInMainWorld('electron', {
  platform: process.platform,
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron,
  },
});