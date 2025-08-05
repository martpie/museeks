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
        },
        plugins: VITE_PLUGINS,
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
    // exclude: ['@lingui/core/macro', '@lingui/react/macro'],
  },
});
