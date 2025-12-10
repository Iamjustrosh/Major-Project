const path = require('path');

module.exports = {
  packagerConfig: {
    asar: true,
    icon: path.resolve(__dirname, 'assets', 'icon'),
    executableName: 'CollabWhiteboard',
    appBundleId: 'com.roshan.collabwhiteboard',
    appCategoryType: 'public.app-category.productivity',
    win32metadata: {
      CompanyName: 'Roshan Jain',
      FileDescription: 'Collaborative Whiteboard App',
      OriginalFilename: 'CollabWhiteboard.exe',
      ProductName: 'Collaborative Whiteboard',
      InternalName: 'CollabWhiteboard'
    }
  },
  rebuildConfig: {},
  makers: [
    // Use ZIP only - creates portable version
    {
      name: '@electron-forge/maker-zip',
      platforms: ['win32']
    }
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-vite',
      config: {
        build: [
          {
            entry: 'src/main.js',
            config: 'vite.main.config.mjs'
          },
          {
            entry: 'src/preload.js',
            config: 'vite.preload.config.mjs'
          }
        ],
        renderer: [
          {
            name: 'main_window',
            config: 'vite.renderer.config.mjs'
          }
        ]
      }
    }
  ]
};