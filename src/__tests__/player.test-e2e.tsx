import { page } from '@vitest/browser/context';
import { expect, test } from 'vitest';

import { beforeEachSetup } from './test-helpers';

beforeEachSetup();

test('Double click on a track should play it and display its metadata', async () => {
  // By default, the player is paused
  await expect
    .element(page.getByTestId('playercontrol-play'))
    .toBeInTheDocument();
  await expect
    .element(page.getByTestId('playercontrol-pause'))
    .not.toBeInTheDocument();

  // Fake the import of tracks
  await page.getByTestId('footer-settings-link').click();
  await page.getByTestId('scan-library-button').click();
  await page.getByTestId('footer-library-link').click();

  // Double-clicking on a track should start the player
  await page.getByTestId('track-row-0').dblClick();

  await expect
    .element(page.getByTestId('playercontrol-play'))
    .not.toBeInTheDocument();
  await expect
    .element(page.getByTestId('playercontrol-pause'))
    .toBeInTheDocument();

  // Check the track info is there
  await expect
    .element(page.getByTestId('playing-track-title'))
    .toHaveTextContent('Whiskey Blues');
  await expect
    .element(page.getByTestId('playing-track-artist-album'))
    .toHaveTextContent('Captain_Sleepy — Another Album');

  // Click on another one
  await page.getByTestId('track-row-2').dblClick();
  await expect
    .element(page.getByTestId('playercontrol-play'))
    .not.toBeInTheDocument();
  await expect
    .element(page.getByTestId('playercontrol-pause'))
    .toBeInTheDocument();

  // Check the new track info is there
  await expect
    .element(page.getByTestId('playing-track-title'))
    .toHaveTextContent('Romantic Blues');
  await expect
    .element(page.getByTestId('playing-track-artist-album'))
    .toHaveTextContent('Jean-Paul-V — Pixabay');

  // Pause
  await page.getByTestId('playercontrol-pause').click();
  await expect
    .element(page.getByTestId('playercontrol-play'))
    .toBeInTheDocument();
  await expect
    .element(page.getByTestId('playercontrol-pause'))
    .not.toBeInTheDocument();
});
