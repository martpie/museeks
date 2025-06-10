/*
|--------------------------------------------------------------------------
| React and Router
|--------------------------------------------------------------------------
*/

import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { QueryClientProvider } from '@tanstack/react-query';
import {
  RouterProvider,
  createHashHistory,
  createRouter,
} from '@tanstack/react-router';
import * as logger from '@tauri-apps/plugin-log';
import React from 'react';
import * as ReactDOM from 'react-dom/client';

import queryClient from './lib/query-client';

/*
|--------------------------------------------------------------------------
| Styles
|--------------------------------------------------------------------------
*/
import 'font-awesome/css/font-awesome.css';
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
| Translations
|--------------------------------------------------------------------------
*/

async function loadTranslation(locale = 'en') {
  const { messages } = await import(`./translations/${locale}.po`);

  i18n.load(locale, messages);
  i18n.activate(locale);
}

/*
|--------------------------------------------------------------------------
| Render the app
|--------------------------------------------------------------------------
*/

(async function createRoot() {
  await logger.attachConsole();
  await loadTranslation('fr'); // TODO :)

  const wrap = document.getElementById('wrap');

  if (wrap) {
    const root = ReactDOM.createRoot(wrap);
    root.render(
      <React.StrictMode>
        <QueryClientProvider client={queryClient}>
          <I18nProvider i18n={i18n}>
            <RouterProvider router={router} />
          </I18nProvider>
        </QueryClientProvider>
      </React.StrictMode>,
    );
  } else {
    document.body.innerHTML = '<div style="text-align: center;">x_x</div>';
  }
})();
