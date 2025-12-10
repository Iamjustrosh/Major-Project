module.exports = {
  packagerConfig: {
    asar: true,
    icon: './assets/icon',
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
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'CollabWhiteboard',
        authors: 'Roshan Jain',
        description: 'Real-time collaborative whiteboard application',
        setupIcon: './assets/icon.ico',
        setupExe: 'CollabWhiteboard-Setup.exe',
        noMsi: true
      }
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin', 'linux', 'win32']
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          maintainer: 'Roshan Jain <roshanjain.220407@gmail.com>',
          homepage: 'https://collabboard-web.vercel.app/',
          icon: './assets/icon.png'
        }
      }
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {
        options: {
          homepage: 'https://collabboard-web.vercel.app/',
          icon: './assets/icon.png'
        }
      }
    }
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-vite',
      config: {
        build: [
          {
            entry: 'src/main.js',
            config: 'vite.main.config.js'
          },
          {
            entry: 'src/preload.js',
            config: 'vite.preload.config.js'
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
  ],
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'iamjustrosh',
          name: 'collab-whiteboard'
        },
        prerelease: false,
        draft: true
      }
    }
  ]
};