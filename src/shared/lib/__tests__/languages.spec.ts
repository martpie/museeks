import fs from 'fs';
import path from 'path';

import { LANGUAGES } from '../languages';

describe('languages', () => {
  test('should all have a valid JSON file containing translations', () => {
    LANGUAGES.forEach((lang) => {
      expect(() => {
        const content = fs.readFileSync(path.join(process.cwd(), 'locales', `${lang}.json`), { encoding: 'utf8' });
        JSON.parse(content);
      }).not.toThrow();
    });
  });
});
