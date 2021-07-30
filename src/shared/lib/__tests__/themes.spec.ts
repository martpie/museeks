import { themes } from '../themes';

describe('themes', () => {
  test('themes should have a unique identifier', () => {
    const themeIds = themes.map((theme) => theme._id);

    expect(new Set(themeIds).size).toBe(themeIds.length);
  });

  test('themeSource should be either "light" or "dark"', () => {
    themes.forEach((theme) => {
      expect(['dark', 'light'].includes(theme.themeSource)).toBe(true);
    });
  });

  test('keys should be the same for every theme', () => {
    const [firstTheme] = themes;

    themes.forEach((theme) => {
      expect(Object.keys(theme)).toStrictEqual(Object.keys(firstTheme));
    });
  });

  test('variables names should be the same for every theme', () => {
    const [firstTheme] = themes;

    themes.forEach((theme) => {
      expect(Object.keys(theme.variables)).toStrictEqual(Object.keys(firstTheme.variables));
    });
  });
});
