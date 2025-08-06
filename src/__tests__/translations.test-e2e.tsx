import { page } from '@vitest/browser/context';
import { expect, test } from 'vitest';

import { beforeEachSetup } from './test-helpers';

beforeEachSetup();

test('The language selector should update the UI', async () => {
  const viewMessage = page.getByTestId('view-message');

  await expect.element(viewMessage).toBeVisible();
  await expect
    .element(viewMessage)
    .toHaveTextContent(
      'There is no music in your library :(you can add your music here',
    );

  await page.getByTestId('footer-settings-link').click();
  await page.getByTestId('settings-nav-link/settings/ui').click();
  await page
    .getByTestId('language-selector')
    .selectOptions('Français (French)');

  await page.getByTestId('footer-library-link').click();
  await expect
    .element(viewMessage)
    .toHaveTextContent(
      'Votre bibliothèque est vide :(vous pouvez ajouter votre musique ici',
    );
});
