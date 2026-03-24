import { expect, test } from 'vite-plus/test';
import { page } from 'vite-plus/test/browser';

import {
  beforeEachSetup,
  getTrackByName,
  setupScannedLibrary,
} from './e2e-helpers';

beforeEachSetup();

test('Double click on a track should play it and display its metadata', async () => {
  // By default, the player is paused
  await expect
    .element(page.getByRole('button', { name: 'Play' }))
    .toBeInTheDocument();
  await expect
    .element(page.getByRole('button', { name: 'Pause' }))
    .not.toBeInTheDocument();

  await setupScannedLibrary();

  // Double-clicking on a track should start the player
  await getTrackByName(/Whiskey Blues/).dblClick();

  await expect
    .element(page.getByRole('button', { name: 'Play' }))
    .not.toBeInTheDocument();
  await expect
    .element(page.getByRole('button', { name: 'Pause' }))
    .toBeInTheDocument();

  // Check the track info is there
  await expect
    .element(page.getByRole('banner').getByText('Whiskey Blues'))
    .toBeVisible();
  await expect
    .element(page.getByRole('banner'))
    .toHaveTextContent('Captain_Sleepy — Another Album');

  // Click on another one
  await getTrackByName(/Romantic Blues/).dblClick();
  await expect
    .element(page.getByRole('button', { name: 'Play' }))
    .not.toBeInTheDocument();
  await expect
    .element(page.getByRole('button', { name: 'Pause' }))
    .toBeInTheDocument();

  // Check the new track info is there
  await expect
    .element(page.getByRole('banner').getByText('Romantic Blues'))
    .toBeVisible();
  await expect
    .element(page.getByRole('banner'))
    .toHaveTextContent('Jean-Paul-V — Pixabay');

  // Pause
  await page.getByRole('button', { name: 'Pause' }).click();
  await expect
    .element(page.getByRole('button', { name: 'Play' }))
    .toBeInTheDocument();
  await expect
    .element(page.getByRole('button', { name: 'Pause' }))
    .not.toBeInTheDocument();
});
