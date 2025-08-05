/*
|--------------------------------------------------------------------------
| React and Router
|--------------------------------------------------------------------------
*/

import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { QueryClientProvider } from '@tanstack/react-query';
import {
  createHashHistory,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import * as logger from '@tauri-apps/plugin-log';
import React from 'react';
import * as ReactDOM from 'react-dom/client';

import { loadTranslation } from './lib/i18n';
import queryClient from './lib/query-client';

/*
|--------------------------------------------------------------------------
| Styles
|--------------------------------------------------------------------------
*/
import 'normalize.css/normalize.css';
import './styles/general.css';

/*
|--------------------------------------------------------------------------
| Routing
|--------------------------------------------------------------------------
*/
import { routeTree } from './generated/route-tree';

const router = createRouter({
  routeTree,
  history: createHashHistory(),
  scrollRestoration: false,
  notFoundMode: 'root',
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

/*
|--------------------------------------------------------------------------
| Render the app
|--------------------------------------------------------------------------
*/

export const app = (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <I18nProvider i18n={i18n}>
        <RouterProvider router={router} />
      </I18nProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

(async function createRoot() {
  // don't auto-execute this for E2E tests, as the test is responsible for
  // rendering the app
  if (import.meta.env.MODE === 'test') {
    return;
  }

  Promise.allSettled([
    logger.attachConsole(),
    loadTranslation(window.__MUSEEKS_INITIAL_CONFIG.language),
  ]);

  const wrap = document.getElementById('wrap');

  if (wrap) {
    const root = ReactDOM.createRoot(wrap);
    root.render(app);
  } else {
    document.body.innerHTML = '<div style="text-align: center;">x_x</div>';
  }
})();
