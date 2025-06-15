export const DEFAULT_LOCALE = {
  label: 'English',
  englishLabel: null,
  code: 'en',
  contributors: ['Pierre de la Martinière'],
};

// Are you looking to add support for a language?
// 1. Add the language information below
// 2. Run bun run gen:translations
// 3. Edit the generated file in src/translations/<locale>.po
// 4. Profit
export const NON_DEFAULT_LOCALES = [
  {
    label: 'Français',
    englishLabel: 'French',
    code: 'fr',
    contributors: ['Pierre de la Martinière'],
  },
];

export const ALL_LOCALES = [DEFAULT_LOCALE, ...NON_DEFAULT_LOCALES];
