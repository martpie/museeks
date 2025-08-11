export const DEFAULT_LANGUAGE = {
  label: 'English',
  englishLabel: null,
  code: 'en',
  contributors: ['Pierre de la Martinière'],
};

// Are you looking to add support for a language?
// 1. Add the language information below
// 2. Run npm run gen:translations
// 3. Edit the generated file in src/translations/<language>.po
// 4. Profit
export const NON_DEFAULT_LANGUAGE = [
  {
    label: 'Français',
    englishLabel: 'French',
    code: 'fr',
    contributors: ['Pierre de la Martinière'],
  },
  {
    label: 'Русский',
    englishLabel: 'Russian',
    code: 'ru',
    contributors: ['Ildar Nizamov'],
  },
  {
    label: '简体中文',
    englishLabel: 'Simplified Chinese',
    code: 'zh-CN',
    contributors: ['Tang Shijian'],
  },
];

export const ALL_LANGUAGES = [DEFAULT_LANGUAGE, ...NON_DEFAULT_LANGUAGE];
