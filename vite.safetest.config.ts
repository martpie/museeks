/// <reference types="vitest" />

import process from 'node:process';

import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  test: {
    globals: true,
    testTimeout: 30_000,
    outputFile: 'results.json',
    setupFiles: ['setup-safetest'],
    include: ['**/*.safetest.?(c|m)[jt]s?(x)'],
    // threads: process.env.CI,
    // inspect: !process.env.CI,
  },
});
