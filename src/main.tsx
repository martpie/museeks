/*
|--------------------------------------------------------------------------
| React and Router
|--------------------------------------------------------------------------
*/

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
  await logger.attachConsole();

  const wrap = document.getElementById('wrap');

  if (wrap) {
    const root = ReactDOM.createRoot(wrap);
    root.render(
      <React.StrictMode>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </React.StrictMode>,
    );
  } else {
    document.body.innerHTML = '<div style="text-align: center;">x_x</div>';
  }
})();
