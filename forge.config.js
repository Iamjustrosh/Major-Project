const path = require('path');

module.exports = {
  packagerConfig: {
    asar: true,
    icon: path.resolve(__dirname, 'assets', 'icon'),
    executableName: 'CollabWhiteboard_TldrawSync',
    appBundleId: 'com.roshan.collabWhiteboard_TldrawSync',
    appCategoryType: 'public.app-category.productivity',
    win32metadata: {
      CompanyName: 'Roshan Jain',
      FileDescription: 'Collaborative Whiteboard_TldrawSync App',
      OriginalFilename: 'CollabWhiteboard_TldrawSync.exe',
      ProductName: 'Collaborative Whiteboard_TldrawSync',
      InternalName: 'CollabWhiteboard_TldrawSync'
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