import { page, userEvent } from '@vitest/browser/context';
import { expect, test } from 'vitest';

import { beforeEachSetup } from './test-helpers';

beforeEachSetup();

test('The library tab should display all tracks', async () => {
  // Fake the import of tracks
  await page.getByTestId('footer-settings-link').click();
  await page.getByTestId('scan-library-button').click();
  await page.getByTestId('footer-library-link').click();

  // Ensure we have the 3 test-tracks, but no more
  await expect.element(page.getByTestId('track-row-0')).toBeInTheDocument();
  await expect.element(page.getByTestId('track-row-1')).toBeInTheDocument();
  await expect.element(page.getByTestId('track-row-2')).toBeInTheDocument();
  await expect.element(page.getByTestId('track-row-3')).not.toBeInTheDocument();

  await expect
    .element(page.getByTestId('track-row-0'))
    .toHaveAttribute('aria-selected', 'false');
  await expect
    .element(page.getByTestId('track-row-1'))
    .toHaveAttribute('aria-selected', 'false');
  await expect
    .element(page.getByTestId('track-row-2'))
    .toHaveAttribute('aria-selected', 'false');
});

test('Tracks should selectable via click + modifiers', async () => {
  // Fake the import of tracks
  await page.getByTestId('footer-settings-link').click();
  await page.getByTestId('scan-library-button').click();
  await page.getByTestId('footer-library-link').click();

  const firstTrack = page.getByTestId(/track-row-/).first();
  const secondTrack = page.getByTestId(/track-row-/).nth(1);
  const thirdTrack = page.getByTestId(/track-row-/).nth(2);

  // Click on a track should select it
  await secondTrack.click();
  await expect.element(firstTrack).toHaveAttribute('aria-selected', 'false');
  await expect.element(secondTrack).toHaveAttribute('aria-selected', 'true');
  await expect.element(thirdTrack).toHaveAttribute('aria-selected', 'false');

  await thirdTrack.click();
  await expect.element(firstTrack).toHaveAttribute('aria-selected', 'false');
  await expect.element(secondTrack).toHaveAttribute('aria-selected', 'false');
  await expect.element(thirdTrack).toHaveAttribute('aria-selected', 'true');

  // Cmd/Ctrl + click on a selected track should deselect it
  await userEvent.click(firstTrack, { modifiers: ['ControlOrMeta'] });
  await expect.element(firstTrack).toHaveAttribute('aria-selected', 'true');
  await expect.element(secondTrack).toHaveAttribute('aria-selected', 'false');
  await expect.element(thirdTrack).toHaveAttribute('aria-selected', 'true');

  // Clicking a single track should select this one and deselect all others
  await firstTrack.click();
  await expect.element(firstTrack).toHaveAttribute('aria-selected', 'true');
  await expect.element(secondTrack).toHaveAttribute('aria-selected', 'false');
  await expect.element(thirdTrack).toHaveAttribute('aria-selected', 'false');

  // Clicking on a track with Shift should select all tracks in between
  await thirdTrack.click({ modifiers: ['Shift'] });
  await expect.element(firstTrack).toHaveAttribute('aria-selected', 'true');
  await expect.element(secondTrack).toHaveAttribute('aria-selected', 'true');
  await expect.element(thirdTrack).toHaveAttribute('aria-selected', 'true');
});

test('Tracks should be selectable via keyboard only (after a single selection)', async () => {
  // Fake the import of tracks
  await page.getByTestId('footer-settings-link').click();
  await page.getByTestId('scan-library-button').click();
  await page.getByTestId('footer-library-link').click();

  const firstTrack = page.getByTestId(/track-row-/).first();
  const secondTrack = page.getByTestId(/track-row-/).nth(1);
  const thirdTrack = page.getByTestId(/track-row-/).nth(2);

  await firstTrack.click();
  await expect.element(firstTrack).toHaveAttribute('aria-selected', 'true');
  await expect.element(secondTrack).toHaveAttribute('aria-selected', 'false');
  await expect.element(thirdTrack).toHaveAttribute('aria-selected', 'false');

  // Cmd+A should select all tracks
  // await userEvent.keyboard('{ControlOrMeta>}A{/ControlOrMeta}'); // not working, select the text instead :(
  // await expect.element(firstTrack).toHaveAttribute('aria-selected', 'true');
  // await expect.element(secondTrack).toHaveAttribute('aria-selected', 'true');
  // await expect.element(thirdTrack).toHaveAttribute('aria-selected', 'true');

  // Use single arrow-up/down to select the previous/next track
  await userEvent.keyboard('[ArrowDown]');
  await expect.element(firstTrack).toHaveAttribute('aria-selected', 'false');
  await expect.element(secondTrack).toHaveAttribute('aria-selected', 'true');

  await userEvent.keyboard('[ArrowUp]');
  await expect.element(firstTrack).toHaveAttribute('aria-selected', 'true');
  await expect.element(secondTrack).toHaveAttribute('aria-selected', 'false');

  await userEvent.keyboard('[ArrowDown],[ArrowDown]');
  await expect.element(firstTrack).toHaveAttribute('aria-selected', 'false');
  await expect.element(secondTrack).toHaveAttribute('aria-selected', 'false');
  await expect.element(thirdTrack).toHaveAttribute('aria-selected', 'true');

  // Use Shift+ArrowUp/Down to select multiple tracks
  await userEvent.keyboard('{Shift>}{ArrowUp}{/Shift}');
  await expect.element(firstTrack).toHaveAttribute('aria-selected', 'false');
  await expect.element(secondTrack).toHaveAttribute('aria-selected', 'true');
  await expect.element(thirdTrack).toHaveAttribute('aria-selected', 'true');

  await userEvent.keyboard('{Shift>}{ArrowUp}{/Shift}');
  await expect.element(firstTrack).toHaveAttribute('aria-selected', 'true');
  await expect.element(secondTrack).toHaveAttribute('aria-selected', 'true');
  await expect.element(thirdTrack).toHaveAttribute('aria-selected', 'true');

  // Shift+Arrow should go both ways
  await secondTrack.click();
  await userEvent.keyboard('{Shift>}{ArrowUp}{/Shift}');
  await expect.element(firstTrack).toHaveAttribute('aria-selected', 'true');
  await expect.element(secondTrack).toHaveAttribute('aria-selected', 'true');
  await expect.element(thirdTrack).toHaveAttribute('aria-selected', 'false');

  await userEvent.keyboard('{Shift>}{ArrowDown}{/Shift}');
  await expect.element(firstTrack).toHaveAttribute('aria-selected', 'true');
  await expect.element(secondTrack).toHaveAttribute('aria-selected', 'true');
  await expect.element(thirdTrack).toHaveAttribute('aria-selected', 'true');
});

test('Search should filter tracks in the library', async () => {
  // Fake the import of tracks
  await page.getByTestId('footer-settings-link').click();
  await page.getByTestId('scan-library-button').click();
  await page.getByTestId('footer-library-link').click();

  const search = page.getByTestId('library-search');
  const searchClear = page.getByTestId('library-search-clear');

  // Searching by a common word should display all tracks
  await search.fill('Blues');
  await expect.element(page.getByTestId('track-row-0')).toBeInTheDocument();
  await expect.element(page.getByTestId('track-row-1')).toBeInTheDocument();
  await expect.element(page.getByTestId('track-row-2')).toBeInTheDocument();

  // Searching by a specific word should display only the matching tracks,
  // regardless of accents and cases
  await search.fill('pixAbày');
  await expect.element(page.getByTestId('track-row-0')).not.toBeInTheDocument();
  await expect.element(page.getByTestId('track-row-1')).toBeInTheDocument();
  await expect.element(page.getByTestId('track-row-2')).toBeInTheDocument();

  await search.fill('hisk');
  await expect.element(page.getByTestId('track-row-0')).toBeInTheDocument();
  await expect.element(page.getByTestId('track-row-1')).not.toBeInTheDocument();
  await expect.element(page.getByTestId('track-row-2')).not.toBeInTheDocument();

  // Searching by an unknown word should display no tracks and a warning
  await search.fill('Something that does not exist');
  await expect.element(page.getByTestId('track-row-0')).not.toBeInTheDocument();
  await expect.element(page.getByTestId('track-row-1')).not.toBeInTheDocument();
  await expect.element(page.getByTestId('track-row-2')).not.toBeInTheDocument();
  await expect
    .element(page.getByTestId('view-message'))
    .toHaveTextContent('Your search returned no results');

  // Clicking the search clear button should clear the search
  await searchClear.click();
  await expect.element(page.getByTestId('track-row-0')).toBeInTheDocument();
  await expect.element(page.getByTestId('track-row-1')).toBeInTheDocument();
  await expect.element(page.getByTestId('track-row-2')).toBeInTheDocument();
});
