import process from 'node:process';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  define: {
    'process.env': process.env,
  },
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
            provider: 'playwright',
            viewport: {
              width: 900,
              height: 500,
            },

            // https://vitest.dev/guide/browser/playwright
            instances: [
              {
                browser: 'webkit',
              },
            ],
          },
        },
      },
    ],
  },
  optimizeDeps: {
    include: ['react/jsx-dev-runtime'],
  },
});
