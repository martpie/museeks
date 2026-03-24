import { i18n } from '@lingui/core';
import { beforeEach, vi } from 'vite-plus/test';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/context';

import { MOCK_CONFIG } from '../lib/__mocks__/bridge-config.ts';
import { messages } from '../translations/en.po';

/**
 * E2E test setup, stubbing globals, bridges, setting up i18n and rendering the app
 */
export function beforeEachSetup() {
  beforeEach(async () => {
    // Stub Museeks Globals
    vi.stubGlobal('__MUSEEKS_INITIAL_CONFIG', MOCK_CONFIG);
    vi.stubGlobal('__MUSEEKS_INITIAL_QUEUE', []);
    vi.stubGlobal('__MUSEEKS_PLATFORM', import.meta.env.PLATFORM);

    // Stub Tauri Globals
    vi.stubGlobal('__TAURI_INTERNALS__', {
      __TAURI_PATTERN__: { pattern: 'brownfield' },
      plugins: { path: { sep: '/', delimiter: ':' } },
      metadata: {
        currentWindow: { label: 'main' },
        currentWebview: { label: 'main' },
      },
      callbacks: new Map(),
      // mocks
      invoke: vi.fn(),
      convertFileSrc: (path: string) => path,
      ipc: vi.fn(),
      postMessage: vi.fn(),
      runCallback: vi.fn(),
      transformCallback: vi.fn(),
      unregisterCallback: vi.fn(),
    });
    vi.stubGlobal('__TAURI_EVENT_PLUGIN_INTERNALS__', {
      unregisterListener: vi.fn(),
    });
    vi.stubGlobal('__TAURI_OS_PLUGIN_INTERNALS__', {
      // TODO: replace that with Linux values
      arch: 'aarch64',
      eol: '↵',
      exe_extension: '',
      family: 'unix',
      os_type: 'macos',
      platform: 'macos',
      version: '15.5.0',
    });

    // Activate Lingui
    i18n.load('en', messages);
    i18n.activate('en');

    // Mock Bridges
    vi.doMock('../lib/bridge-database');
    vi.doMock('../lib/bridge-config');
    vi.doMock('../lib/cover');

    // Initial Location
    window.location.hash = '#/library';

    // Render the app
    const { app } = await import('../main.tsx');
    await render(app, {
      wrapper: ({ children }) => <div id="wrap">{children}</div>,
    });
  });
}

/** ----------------------------------------------------------------------------
 * Various helpers for triggering common actions on e2e tests
 * -------------------------------------------------------------------------- */

// Get the main navigation element for main navigation between library, settings, etc
export function getMainNavigation() {
  return page.getByRole('navigation', { name: 'Main navigation' });
}

// Get the track list element
export function getTrackList() {
  return page.getByRole('listbox', { name: 'Track list' });
}

// Get a track row by its title
export function getTrackByName(name: string | RegExp) {
  return getTrackList().getByRole('option', { name });
}

// Get a track row by its position in the list
export function getTrackAt(index: number) {
  return getTrackList().getByRole('option').nth(index);
}

// Get a sort button from the track list header by column name
export function getSortButton(name: string) {
  return page
    .getByRole('group', { name: 'Track list sorting options' })
    .getByRole('button', { name });
}

// Trigger a fake scan of the library based on mocks
export async function setupScannedLibrary() {
  await getMainNavigation().getByRole('link', { name: 'Settings' }).click();
  await page.getByRole('button', { name: 'Scan' }).click();
  await getMainNavigation().getByRole('link', { name: 'Library' }).click();
}
