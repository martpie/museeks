module.exports = {
  packagerConfig: {},
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-dmg',
    },
    {
      name: '@electron-forge/maker-squirrel',
    },
    {
      name: '@electron-forge/maker-deb',
    },
    {
      name: '@electron-forge/maker-rpm',
    },
    {
      name: '@electron-forge/maker-zip',
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-vite',
      config: {
        build: [
          {
            // `entry` is an alias for `build.lib.entry`
            // in the corresponding file of `config`.
            entry: 'src/main/entrypoint.main.ts',
            config: 'vite.main.config.ts',
          },
          {
            entry: 'src/preload/entrypoint.preload.ts',
            config: 'vite.preload.config.ts',
          },
        ],
        renderer: [
          {
            name: 'main_window',
            config: 'vite.renderer.config.ts',
          },
        ],
      },
    },
  ],
};
