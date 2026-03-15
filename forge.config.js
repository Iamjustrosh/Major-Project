const path = require('path');

module.exports = {
  packagerConfig: {
    asar: true,
    icon: path.resolve(__dirname, 'assets', 'icon'),
    executableName: 'CollabWhiteboard V2',
    appBundleId: 'com.roshan.collabWhiteboard V2',
    appCategoryType: 'public.app-category.productivity',
    win32metadata: {
      CompanyName: 'Roshan Jain',
      FileDescription: 'Collaborative Whiteboard V2 App',
      OriginalFilename: 'CollabWhiteboard V2.exe',
      ProductName: 'Collaborative Whiteboard V2',
      InternalName: 'CollabWhiteboard V2'
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