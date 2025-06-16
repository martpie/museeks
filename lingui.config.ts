import { defineConfig } from '@lingui/cli';

import { ALL_LANGUAGES, DEFAULT_LANGUAGE } from './src/translations/languages';

/**
 * Lingui Config - https://lingui.dev/ref/conf
 */
export default defineConfig({
  sourceLocale: DEFAULT_LANGUAGE.code,
  fallbackLocales: {
    default: DEFAULT_LANGUAGE.code,
  },
  locales: ALL_LANGUAGES.map((l) => l.code),
  catalogs: [
    {
      name: 'main',
      path: '<rootDir>/src/translations/{locale}',
      include: ['src'],
    },
  ],
  orderBy: 'origin',
});
