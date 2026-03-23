import { expect, test } from 'vite-plus/test';
import { page, userEvent } from 'vite-plus/test/browser';

import { beforeEachSetup, goToPlaylists } from './test-helpers';

beforeEachSetup();

async function createPlaylist() {
  await page.getByTestId('playlist-new-button').click();
}

async function renamePlaylist(currentName: string, newName: string) {
  await page.getByRole('link', { name: currentName }).dblClick();
  const input = page.getByTestId('playlist-rename-input');
  await input.clear();
  await input.fill(newName);
  await userEvent.keyboard('[Enter]');
}

test('Playlists', async () => {
  await goToPlaylists();

  // Empty state when no playlists exist
  await expect
    .element(page.getByTestId('view-message'))
    .toHaveTextContent("You haven't created any playlist yet");

  // Clicking "create one now" creates a playlist and shows the empty playlist view
  await page.getByTestId('create-playlist-call-to-action').click();
  await expect
    .element(page.getByTestId('view-message'))
    .toHaveTextContent('Empty playlist');

  // Creating more playlists via the + button shows them all in the sidebar
  await createPlaylist();
  await createPlaylist();
  const playlistLinks = page.getByRole('link', { name: 'New playlist' });
  await expect.element(playlistLinks.nth(0)).toBeInTheDocument();
  await expect.element(playlistLinks.nth(1)).toBeInTheDocument();
  await expect.element(playlistLinks.nth(2)).toBeInTheDocument();
  await expect.element(playlistLinks.nth(3)).not.toBeInTheDocument();

  // Rename via Escape cancels the rename
  await page.getByRole('link', { name: 'New playlist' }).first().dblClick();
  const input = page.getByTestId('playlist-rename-input');
  await input.clear();
  await input.fill('Cancelled Name');
  await userEvent.keyboard('[Escape]');
  await expect
    .element(page.getByRole('link', { name: 'Cancelled Name' }))
    .not.toBeInTheDocument();

  // Rename via Enter commits the new name
  await renamePlaylist('New playlist', 'Alpha');
  await expect
    .element(page.getByRole('link', { name: 'Alpha' }))
    .toBeInTheDocument();

  await renamePlaylist('New playlist', 'Another Blues');
  await renamePlaylist('New playlist', 'Best Of');

  // Playlists are grouped by first letter
  const letterGroups = page.getByTestId('sidenav-letter-group');
  await expect.element(letterGroups.nth(0)).toHaveTextContent('A');
  await expect.element(letterGroups.nth(1)).toHaveTextContent('B');
  await expect.element(letterGroups.nth(2)).not.toBeInTheDocument();

  await expect
    .element(page.getByRole('link', { name: 'Alpha' }))
    .toBeInTheDocument();
  await expect
    .element(page.getByRole('link', { name: 'Another Blues' }))
    .toBeInTheDocument();
  await expect
    .element(page.getByRole('link', { name: 'Best Of' }))
    .toBeInTheDocument();
});
