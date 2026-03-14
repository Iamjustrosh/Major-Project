// src/main/codeExecutionAPI.js (CommonJS version)
const { ipcMain } = require('electron');
const https = require('https');

function setupCodeExecutionAPI() {
  ipcMain.handle('execute-code', async (event, { code, language, stdin = '' }) => {
    try {
      console.log('🚀 Executing code:', { language, codeLength: code.length });

      // Map frontend language names to JDoodle language names
      const languageMap = {
        'python3': 'python3',
        'javascript': 'nodejs',
        'cpp': 'cpp17',
        'java': 'java',
      };

      // JDoodle version indices
      const versionMap = {
        'python3': '3',
        'nodejs': '4',
        'cpp17': '5',
        'java': '4',
      };

      const jdoodleLanguage = languageMap[language] || 'python3';
      const versionIndex = versionMap[jdoodleLanguage] || '0';

      // Prepare JDoodle API request
      const postData = JSON.stringify({
        clientId: 'process.env.JDOODLE_CLIENT_ID',        // ← Get FREE from https://www.jdoodle.com/compiler-api
        clientSecret: 'process.env.JDOODLE_CLIENT_SECRET', // ← 200 requests/day, no credit card
        script: code,
        language: jdoodleLanguage,
        versionIndex: versionIndex,
        stdin: stdin,
      });

      const options = {
        hostname: 'api.jdoodle.com',
        path: '/v1/execute',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
      };

      // Make HTTPS request to JDoodle
      const result = await new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
          let data = '';

          res.on('data', (chunk) => {
            data += chunk;
          });

          res.on('end', () => {
            try {
              const parsedData = JSON.parse(data);
              console.log('✅ Code executed successfully');
              resolve(parsedData);
            } catch (error) {
              reject(new Error(`Failed to parse response: ${error.message}`));
            }
          });
        });

        req.on('error', (error) => {
          reject(new Error(`Request failed: ${error.message}`));
        });

        req.write(postData);
        req.end();
      });

      return result;

    } catch (error) {
      console.error('❌ Code execution error:', error);
      return {
        error: error.message,
        output: `Error: ${error.message}`
      };
    }
  });

  console.log('✅ Code execution IPC handler registered');
}

module.exports = { setupCodeExecutionAPI };