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
import { bootstrap } from 'safetest/react';

import { loadTranslation } from './lib/i18n';
import queryClient from './lib/query-client';

/*
|--------------------------------------------------------------------------
| Styles
|--------------------------------------------------------------------------
*/
import 'normalize.css/normalize.css';
import './styles/general.css';

import process from 'node:process';

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

(async function createRoot() {
  Promise.allSettled([
    logger.attachConsole(),
    loadTranslation(window.__MUSEEKS_INITIAL_CONFIG.language),
  ]);

  const wrap = document.getElementById('wrap');

  const App = (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <I18nProvider i18n={i18n}>
          <RouterProvider router={router} />
        </I18nProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );

  if (wrap) {
    const isDev = process.env.NODE_ENV !== 'production';

    bootstrap({
      app: App,
      render: (element) => ReactDOM.createRoot(wrap).render(element),

      // Vite:
      importGlob: isDev && import.meta.glob('./**/*.safetest.{j,t}s{,x}'),
    });
  } else {
    document.body.innerHTML = '<div style="text-align: center;">x_x</div>';
  }
})();
