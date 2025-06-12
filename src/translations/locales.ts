// Are you looking to add support for a language?
// 1. Add the language information below
// 2. Run bun run gen:translations
// 3. Edit the generated file in src/translations/<locale>.po
// 4. Profit
export const ALL_LOCALES = [
  // Default / Fallback
  {
    label: 'English',
    englishLabel: null,
    code: 'en',
  },
  // Additional languages below
  {
    label: 'Français',
    englishLabel: 'French',
    code: 'fr',
  },
];
