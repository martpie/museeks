import { defineConfig } from '@lingui/cli';

import { ALL_LOCALES } from './src/translations/locales';

const LOCALES_CODE = ALL_LOCALES.map((l) => l.code);
const [DEFAULT_LOCALE_CODE] = LOCALES_CODE;

if (DEFAULT_LOCALE_CODE !== 'en') {
  throw new Error(
    `Default locale must be 'en', but got '${DEFAULT_LOCALE_CODE}'. Please ensure the locales configuration is correct`,
  );
}

/**
 * Lingui Config - https://lingui.dev/ref/conf
 */
export default defineConfig({
  sourceLocale: DEFAULT_LOCALE_CODE,
  fallbackLocales: {
    default: DEFAULT_LOCALE_CODE,
  },
  locales: LOCALES_CODE,
  catalogs: [
    {
      name: 'main',
      path: '<rootDir>/src/translations/{locale}',
      include: ['src'],
    },
  ],
  orderBy: 'origin',
});
