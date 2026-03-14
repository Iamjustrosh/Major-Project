const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const https = require('https');

let mainWindow;
// ✅ Add this function ABOVE setupCodeExecutionAPI()
// ✅ SIMPLER & MORE RELIABLE version — use this instead
function stripInputPrompts(stdout, stdin) {
  if (!stdout) return '';
  if (!stdin) return stdout.trim();

  const inputValues = stdin.split('\n').map(l => l.trim()).filter(Boolean);
  if (inputValues.length === 0) return stdout.trim();

  // Find the position right after the last input value in stdout
  // Everything after that is the real program output
  let lastCutPosition = 0;

  for (const value of inputValues) {
    const idx = stdout.indexOf(value, lastCutPosition);
    if (idx !== -1) {
      // Move cut position to after this value (+ 1 for the newline)
      lastCutPosition = idx + value.length + 1;
    }
  }

  // Everything from lastCutPosition onwards is the real output
  const realOutput = stdout.slice(lastCutPosition).trim();
  
  // Fallback: if nothing left, return full stdout (edge case)
  return realOutput || stdout.trim();
}
// ✅ Code execution handler using Judge0 API
function setupCodeExecutionAPI() {
  ipcMain.handle('execute-code', async (event, { code, language, stdin = '' }) => {
    try {
      console.log('🚀 Executing code with Judge0:', { language, codeLength: code.length });

      // Map languages to Judge0 language IDs
      const languageIds = {
        'python3': 71,      // Python 3.8.1
        'javascript': 63,   // JavaScript (Node.js)
        'cpp': 54,          // C++ (GCC 9.2.0)
        'java': 62,         // Java (OpenJDK 13.0.1)
      };

      const languageId = languageIds[language] || 71;

      const postData = JSON.stringify({
        source_code: code,
        language_id: languageId,
        stdin: stdin,
      });

      const options = {
        hostname: 'judge0-ce.p.rapidapi.com',
        path: '/submissions?base64_encoded=false&wait=true',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': import.meta.env.VITE_JUDGE0_API,  // ← Get FREE from https://rapidapi.com/judge0-official/api/judge0-ce
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
        },
      };

      const result = await new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
          let data = '';
          res.on('data', (chunk) => { data += chunk; });
          res.on('end', () => {
            try {
              const parsed = JSON.parse(data);
              resolve(parsed);
            } catch (e) {
              reject(new Error('Failed to parse response'));
            }
          });
        });
        req.on('error', reject);
        req.write(postData);
        req.end();
      });

      // Build output (without stdin echo)
      let finalOutput = '';

      // Only show program output (stdout)
      if (result.stdout) {
        finalOutput = stripInputPrompts(result.stdout, stdin);
      }

      // Show compilation errors if any
      if (result.compile_output) {
        finalOutput += (finalOutput ? '\n\n' : '') + `📋 Compilation Output:\n${result.compile_output}`;
      }

      // Show runtime errors if any
      if (result.stderr) {
        finalOutput += (finalOutput ? '\n\n' : '') + `⚠️ Runtime Errors:\n${result.stderr}`;
      }

      // Show status if not accepted
      if (result.status && result.status.description !== "Accepted") {
        finalOutput += (finalOutput ? '\n\n' : '') + `⚠️ Status: ${result.status.description}`;
      }

      // Show message if any
      if (result.message && result.message !== "Accepted") {
        finalOutput += (finalOutput ? '\n\n' : '') + `ℹ️  ${result.message}`;
      }

      // Default message if no output
      if (!finalOutput.trim()) {
        finalOutput = "✓ Code executed successfully (no output)";
      }

      console.log('✅ Code executed successfully');
      return {
        output: finalOutput,
        statusCode: 200
      };

    } catch (error) {
      console.error('❌ Execution error:', error);
      
      // Check if it's an API key error
      if (error.message.includes('401') || error.message.includes('403')) {
        return {
          error: 'API Key Required',
          output: `❌ Judge0 API Key Required\n\n` +
            `Get your FREE API key:\n` +
            `1. Go to: https://rapidapi.com/judge0-official/api/judge0-ce\n` +
            `2. Click "Subscribe to Test" → FREE tier (50 requests/day)\n` +
            `3. Copy your API key\n` +
            `4. Add to main file line 37\n\n` +
            `Error: ${error.message}`
        };
      }

      return {
        error: error.message,
        output: `Error: ${error.message}`
      };
    }
  });

  console.log('✅ Judge0 code execution IPC handler registered');
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
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    title: 'Collaborative Whiteboard',
    backgroundColor: '#ffffff',
  });

  // Vite dev server or production build
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    // Open DevTools in development
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

app.whenReady().then(() => {
  setupCodeExecutionAPI(); // ← Register Judge0 handler
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});