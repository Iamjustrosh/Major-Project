const { app, BrowserWindow, ipcMain, session, clipboard, desktopCapturer } = require('electron');
const path = require('path');
const https = require('https');

app.commandLine.appendSwitch('disable-site-isolation-trials');
app.commandLine.appendSwitch('unsafely-treat-insecure-origin-as-secure', 'http://localhost:5173');
app.commandLine.appendSwitch('allow-insecure-localhost');
app.commandLine.appendSwitch('webrtc-ip-handling-policy', 'default_public_and_private_interfaces');

let mainWindow;

function stripInputPrompts(stdout, stdin) {
  if (!stdout) return '';
  if (!stdin) return stdout.trim();
  const inputValues = stdin.split('\n').map(l => l.trim()).filter(Boolean);
  if (inputValues.length === 0) return stdout.trim();
  let lastCutPosition = 0;
  for (const value of inputValues) {
    const idx = stdout.indexOf(value, lastCutPosition);
    if (idx !== -1) lastCutPosition = idx + value.length + 1;
  }
  return stdout.slice(lastCutPosition).trim() || stdout.trim();
}

function setupIPCHandlers() {
  // ── Judge0 ────────────────────────────────────────────────
  ipcMain.handle('execute-code', async (event, { code, language, stdin = '' }) => {
    try {
      const languageIds = { 'python3': 71, 'javascript': 63, 'cpp': 54, 'java': 62 };
      const postData = JSON.stringify({
        source_code: code,
        language_id: languageIds[language] || 71,
        stdin,
      });

      const result = await new Promise((resolve, reject) => {
        const req = https.request({
          hostname: 'judge0-ce.p.rapidapi.com',
          path: '/submissions?base64_encoded=false&wait=true',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-RapidAPI-Key': process.env.VITE_JUDGE0_API,
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
          },
        }, (res) => {
          let data = '';
          res.on('data', c => { data += c; });
          res.on('end', () => { try { resolve(JSON.parse(data)); } catch (e) { reject(e); } });
        });
        req.on('error', reject);
        req.write(postData);
        req.end();
      });

      let out = '';
      if (result.stdout)         out  = stripInputPrompts(result.stdout, stdin);
      if (result.compile_output) out += (out ? '\n\n' : '') + `📋 Compilation:\n${result.compile_output}`;
      if (result.stderr)         out += (out ? '\n\n' : '') + `⚠️ Errors:\n${result.stderr}`;
      if (result.status?.description !== 'Accepted')
                                 out += (out ? '\n\n' : '') + `⚠️ Status: ${result.status?.description}`;
      if (!out.trim())           out  = '✓ Code executed successfully (no output)';
      return { output: out, statusCode: 200 };
    } catch (error) {
      return { error: error.message, output: `Error: ${error.message}` };
    }
  });

  // ── Clipboard (native Electron — bypasses browser permission) ─
  ipcMain.handle('clipboard-write', (_e, text) => {
    try {
      clipboard.writeText(String(text));
      return { success: true };
    } catch (e) {
      console.error('Clipboard error:', e);
      return { success: false, error: e.message };
    }
  });

  // ── Screen share sources ───────────────────────────────────
  ipcMain.handle('get-screen-sources', async () => {
    try {
      const sources = await desktopCapturer.getSources({
        types: ['screen', 'window'],
        thumbnailSize: { width: 320, height: 180 },
        fetchWindowIcons: true,
      });
      return sources.map(s => ({
        id:        s.id,
        name:      s.name,
        thumbnail: s.thumbnail.toDataURL(),
      }));
    } catch (e) {
      console.error('desktopCapturer error:', e);
      return [];
    }
  });

  console.log('✅ IPC handlers registered (Judge0 + clipboard + screen capture)');
}

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      experimentalFeatures: true,
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    title: 'Collaborative Whiteboard',
    backgroundColor: '#000000',
  });

  // ✅ All permissions including clipboard
  const allowedPermissions = [
    'media', 'mediaKeySystem', 'display-capture',
    'clipboard-read', 'clipboard-write',  // ✅ clipboard added
    'notifications', 'geolocation',
  ];

  mainWindow.webContents.session.setPermissionRequestHandler(
    (wc, permission, callback) => callback(allowedPermissions.includes(permission))
  );
  mainWindow.webContents.session.setPermissionCheckHandler(
    (wc, permission) => allowedPermissions.includes(permission)
  );
  mainWindow.webContents.session.setDisplayMediaRequestHandler(
    async (request, callback) => {
      try {
        const sources = await desktopCapturer.getSources({ types: ['screen'] });
        callback(sources.length > 0 ? { video: sources[0], audio: 'loopback' } : {});
      } catch (e) {
        callback({});
      }
    }
  );

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  mainWindow.on('closed', () => { mainWindow = null; });
};

app.whenReady().then(() => {
  app.configureHostResolver({ secureDnsMode: 'off', secureDnsServers: [] });

  // ✅ Default session permissions (same list, including clipboard)
  const allowedPermissions = [
    'media', 'mediaKeySystem', 'display-capture',
    'clipboard-read', 'clipboard-write',  // ✅ clipboard added
    'notifications', 'geolocation',
  ];

  session.defaultSession.setPermissionRequestHandler(
    (wc, p, cb) => cb(allowedPermissions.includes(p))
  );
  session.defaultSession.setPermissionCheckHandler(
    (wc, p) => allowedPermissions.includes(p)
  );
  session.defaultSession.setDisplayMediaRequestHandler(
    async (request, callback) => {
      try {
        const sources = await desktopCapturer.getSources({ types: ['screen'] });
        callback(sources.length > 0 ? { video: sources[0], audio: 'loopback' } : {});
      } catch (e) {
        callback({});
      }
    }
  );

  setupIPCHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});