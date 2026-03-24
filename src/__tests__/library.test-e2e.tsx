import { expect, test } from 'vite-plus/test';
import { page, userEvent } from 'vite-plus/test/browser';

import {
  beforeEachSetup,
  getSortButton,
  getTrackAt,
  getTrackByName,
  setupScannedLibrary,
} from './e2e-helpers';

beforeEachSetup();

test('The library tab should display all tracks', async () => {
  await setupScannedLibrary();

  // Ensure we have the 3 test-tracks, but no more
  await expect.element(getTrackAt(0)).toBeInTheDocument();
  await expect.element(getTrackAt(1)).toBeInTheDocument();
  await expect.element(getTrackAt(2)).toBeInTheDocument();
  await expect.element(getTrackAt(3)).not.toBeInTheDocument();

  await expect.element(getTrackAt(0)).toHaveAttribute('aria-selected', 'false');
  await expect.element(getTrackAt(1)).toHaveAttribute('aria-selected', 'false');
  await expect.element(getTrackAt(2)).toHaveAttribute('aria-selected', 'false');
});

test('Tracks should selectable via click + modifiers', async () => {
  await setupScannedLibrary();

  const firstTrack = getTrackAt(0);
  const secondTrack = getTrackAt(1);
  const thirdTrack = getTrackAt(2);

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
  await userEvent.click(firstTrack, {
    modifiers: ['ControlOrMeta'],
    button: 'left',
  });
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
  await setupScannedLibrary();

  const firstTrack = getTrackAt(0);
  const secondTrack = getTrackAt(1);
  const thirdTrack = getTrackAt(2);

  await expect.element(firstTrack).toHaveTextContent('Whiskey Blues');
  await expect.element(secondTrack).toHaveTextContent('Majestic Blues');
  await expect.element(thirdTrack).toHaveTextContent('Romantic Blues');

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
  await setupScannedLibrary();

  const search = page.getByRole('textbox', { name: 'Search library' });
  const searchClear = page.getByRole('button', { name: 'Clear search' });

  // Searching by a common word should display all tracks
  await search.fill('Blues');
  await expect.element(getTrackAt(0)).toBeInTheDocument();
  await expect.element(getTrackAt(1)).toBeInTheDocument();
  await expect.element(getTrackAt(2)).toBeInTheDocument();

  // Searching by a specific word should display only the matching tracks,
  // regardless of accents and cases
  await search.fill('pixAbày');
  await expect.element(getTrackByName(/Whiskey Blues/)).not.toBeInTheDocument();
  await expect.element(getTrackByName(/Majestic Blues/)).toBeInTheDocument();
  await expect.element(getTrackByName(/Romantic Blues/)).toBeInTheDocument();

  await search.fill('hisk');
  await expect.element(getTrackByName(/Whiskey Blues/)).toBeInTheDocument();
  await expect
    .element(getTrackByName(/Majestic Blues/))
    .not.toBeInTheDocument();
  await expect
    .element(getTrackByName(/Romantic Blues/))
    .not.toBeInTheDocument();

  // Searching by an unknown word should display no tracks and a warning
  await search.fill('Something that does not exist');
  await expect.element(getTrackAt(0)).not.toBeInTheDocument();
  await expect
    .element(page.getByRole('status'))
    .toHaveTextContent('Your search returned no results');

  // Clicking the search clear button should clear the search
  await searchClear.click();
  await expect.element(getTrackAt(0)).toBeInTheDocument();
  await expect.element(getTrackAt(1)).toBeInTheDocument();
  await expect.element(getTrackAt(2)).toBeInTheDocument();
});

test('Column headers should sort tracks in the library', async () => {
  await setupScannedLibrary();

  const firstTrack = getTrackAt(0);
  const secondTrack = getTrackAt(1);
  const thirdTrack = getTrackAt(2);

  const track0content =
    'Whiskey Blues05:00Captain_SleepyAnother Albumrock, blues';
  const track1content = 'Majestic Blues05:00Desicomix07Pixabayblues';
  const track2content = 'Romantic Blues05:00Jean-Paul-VPixabayblues';

  // By default, we sort by artist, album year, album name, track number, disk number
  await expect.element(firstTrack).toHaveTextContent(track0content);
  await expect.element(secondTrack).toHaveTextContent(track1content);
  await expect.element(thirdTrack).toHaveTextContent(track2content);

  // Clicking on the title header should change the sorting to Descending by Artist name
  await getSortButton('Artist').click();
  await expect.element(firstTrack).toHaveTextContent(track2content);
  await expect.element(secondTrack).toHaveTextContent(track1content);
  await expect.element(thirdTrack).toHaveTextContent(track0content);

  // Clicking again should change the sorting back to Ascending by Artist name
  await getSortButton('Artist').click();
  await expect.element(firstTrack).toHaveTextContent(track0content);
  await expect.element(secondTrack).toHaveTextContent(track1content);
  await expect.element(thirdTrack).toHaveTextContent(track2content);

  // Let's sort by title as well
  await getSortButton('Title').click();
  await expect.element(firstTrack).toHaveTextContent(track1content);
  await expect.element(secondTrack).toHaveTextContent(track2content);
  await expect.element(thirdTrack).toHaveTextContent(track0content);
});
