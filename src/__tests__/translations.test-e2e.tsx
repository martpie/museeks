import { i18n } from '@lingui/core';
import { page } from '@vitest/browser/context';
import { beforeEach, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';

import { MOCK_CONFIG } from '../lib/__mocks__/bridge-config';
import { messages } from '../translations/en.po'; // lingui

beforeEach(async () => {
  // Stub Museeks Globals
  vi.stubGlobal('__MUSEEKS_INITIAL_CONFIG', MOCK_CONFIG);
  vi.stubGlobal('__MUSEEKS_INITIAL_QUEUE', []);
  vi.stubGlobal('__MUSEEKS_PLATFORM', 'macos'); // TODO: replace that with Linux values

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
    convertFileSrc: vi.fn(),
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
  vi.mock('../lib/bridge-database');
  vi.mock('../lib/bridge-config');

  // Initial Location
  window.location.hash = '#/library';

  // Render the app
  const { app } = await import('../main.tsx');
  render(app, {
    // biome-ignore lint/nursery/useUniqueElementIds: because.
    wrapper: ({ children }) => <div id="wrap">{children}</div>,
  });
});

test('The language selector should update the UI', async () => {
  expect(true).toBeTruthy();

  await expect.element(page.getByTestId('view-message')).toBeDefined();

  const viewMessage = page.getByTestId('view-message');

  expect(viewMessage).toBeVisible();
  expect(viewMessage).toHaveTextContent(
    'There is no music in your library :(you can add your music here',
  );

  await page.getByTestId('footer-settings-link').click();
  await page.getByTestId('settings-nav-link/settings/ui').click();
  await page
    .getByTestId('language-selector')
    .selectOptions('Français (French)');

  await page.getByTestId('footer-library-link').click();
  expect(viewMessage).toHaveTextContent(
    'Votre bibliothèque est vide :(vous pouvez ajouter votre musique ici',
  );
});
