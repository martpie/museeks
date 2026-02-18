import { i18n } from '@lingui/core';
import { beforeEach, vi } from 'vitest';
import { render } from 'vitest-browser-react';

import { MOCK_CONFIG } from '../lib/__mocks__/bridge-config.ts';
import { messages } from '../translations/en.po';

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
