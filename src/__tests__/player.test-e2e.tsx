import { page } from '@vitest/browser/context';
import { test } from 'vitest';

import { beforeEachSetup } from './test-helpers';

beforeEachSetup();

test('Double click on a track should play it and display metadata', async () => {
  // Fake the import of tracks
  await page.getByTestId('footer-settings-link').click();
  await page.getByTestId('scan-library-button').click();
  await page.getByTestId('footer-library-link').click();

  //
});
