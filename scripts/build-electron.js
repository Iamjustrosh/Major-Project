const { build } = require('vite');
const fs = require('fs');
const path = require('path');

async function buildElectron() {
  console.log('Building Vite app...');
  
  // Build the Vite app
  await build({
    configFile: 'vite.config.js'
  });

  console.log('Copying Electron files...');
  
  // Create dist-electron directory
  if (!fs.existsSync('dist-electron')) {
    fs.mkdirSync('dist-electron');
  }

  // Copy electron files
  fs.copyFileSync('electron/main.js', 'dist-electron/main.js');
  fs.copyFileSync('electron/preload.js', 'dist-electron/preload.js');

  console.log('Build complete! Run: electron-builder');
}

buildElectron().catch(console.error);