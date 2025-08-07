import os from 'node:os';

import { defineConfig } from 'vitest/config';

import { VITE_PLUGINS } from './vite.config';

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          environment: 'node',
          include: ['**/*.test.ts'],
        },
      },
      {
        test: {
          name: 'e2e',
          include: ['**/*.test-e2e.ts', '**/*.test-e2e.tsx'],
          includeTaskLocation: true,
          browser: {
            enabled: true,
            provider: 'playwright', // webdriverio?
            viewport: {
              width: 900,
              height: 500,
            },

            // https://vitest.dev/guide/browser/playwright
            instances: [{ browser: 'webkit' }],
          },
          env: {
            PLATFORM: getTauriPlatform(),
          },
        },
        plugins: VITE_PLUGINS,
        publicDir: 'src/__tests__/assets',
      },
    ],
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom/client',
      'react/jsx-dev-runtime',
      '@lingui/core',
      '@lingui/react',
      'vitest-browser-react',
    ],
  },
});

function getTauriPlatform() {
  switch (os.platform()) {
    case 'darwin':
      return 'macos';
    case 'win32':
      return 'windows';
    case 'linux':
      return 'linux';
    default:
      throw new Error(`Unsupported platform: ${os.platform()}`);
  }
}
