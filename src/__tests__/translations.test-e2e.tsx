import { expect, test } from 'vite-plus/test';
import { page } from 'vite-plus/test/browser';

import { beforeEachSetup, getMainNavigation } from './e2e-helpers';

beforeEachSetup();

test('The language selector should update the UI', async () => {
  const viewMessage = page.getByRole('status');

  await expect.element(viewMessage).toBeVisible();
  await expect
    .element(viewMessage)
    .toHaveTextContent(
      'There is no music in your libraryyou can add your music here',
    );

  await getMainNavigation().getByRole('link', { name: 'Settings' }).click();
  await page.getByRole('link', { name: 'Interface' }).click();
  await page
    .getByRole('combobox', { name: 'Language' })
    .selectOptions('Français (French)');

  await getMainNavigation().getByRole('link', { name: 'Bibliothèque' }).click();
  await expect
    .element(viewMessage)
    .toHaveTextContent(
      'Votre bibliothèque est videvous pouvez ajouter votre musique ici',
    );
});
