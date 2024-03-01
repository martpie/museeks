/*
|--------------------------------------------------------------------------
| React and Router
|--------------------------------------------------------------------------
*/

import React from 'react';
import * as ReactDOM from 'react-dom/client';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { RouterProvider } from 'react-router-dom';
import { attachConsole } from '@tauri-apps/plugin-log';
import { type } from '@tauri-apps/plugin-os';

import config from './lib/config';

/*
|--------------------------------------------------------------------------
| Styles
|--------------------------------------------------------------------------
*/
import 'font-awesome/css/font-awesome.css';
import 'normalize.css/normalize.css';
import './styles/main.module.css';

/*
|--------------------------------------------------------------------------
| Render the app
|--------------------------------------------------------------------------
*/

(async function instantiateMuseeks() {
  //  Async instantiations: we need to execute a couple of async tasks before
  // rendering the app
  await Promise.allSettled([attachConsole(), config.init()]);
  window.__museeks_osType = await type();

  // We import the app content asynchronously so synchronous instantiations (like stores)
  // can make use of __museeks_initial_config (hacky, I know).
  const router = (await import('./views/router')).default;
  const wrap = document.getElementById('root');

  if (wrap) {
    const root = ReactDOM.createRoot(wrap);
    root.render(
      <React.StrictMode>
        <DndProvider backend={HTML5Backend}>
          <RouterProvider router={router} />
        </DndProvider>
      </React.StrictMode>,
    );
  }
})();
