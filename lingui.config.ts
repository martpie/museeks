import { defineConfig } from '@lingui/cli';

import { ALL_LOCALES, DEFAULT_LOCALE } from './src/translations/locales';

/**
 * Lingui Config - https://lingui.dev/ref/conf
 */
export default defineConfig({
  sourceLocale: DEFAULT_LOCALE.code,
  fallbackLocales: {
    default: DEFAULT_LOCALE.code,
  },
  locales: ALL_LOCALES.map((l) => l.code),
  catalogs: [
    {
      name: 'main',
      path: '<rootDir>/src/translations/{locale}',
      include: ['src'],
    },
  ],
  orderBy: 'origin',
});
