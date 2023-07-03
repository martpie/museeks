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

import router from './views/router';
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

const wrap = document.getElementById('wrap');

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
