import { defineConfig } from '@lingui/cli';

const DEFAULT_LOCALE = 'en';

// Are you looking to add support for a language?
// 1. Add the language name below
// 2. Run bun run intl-extract
// 3. Edit the generated file in src/translations/<locale>.po
// 4. Profit
const SUPPORTED_LOCALES = [DEFAULT_LOCALE];

/**
 * Lingui Config - https://lingui.dev/ref/conf
 */
export default defineConfig({
  sourceLocale: DEFAULT_LOCALE,
  fallbackLocales: {
    default: DEFAULT_LOCALE,
  },
  locales: SUPPORTED_LOCALES,
  catalogs: [
    {
      name: 'main',
      path: '<rootDir>/src/translations/{locale}',
      include: ['src'],
    },
  ],
  orderBy: 'origin',
});
