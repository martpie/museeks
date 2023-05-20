/*
|--------------------------------------------------------------------------
| React and Router
|--------------------------------------------------------------------------
*/

import React from 'react';
import * as ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { RouterProvider } from 'react-router-dom';

import Root from './Root';
import store from './store/store';
import router from './views/router';

/*
|--------------------------------------------------------------------------
| Styles
|--------------------------------------------------------------------------
*/

import '../../node_modules/react-rangeslider/lib/index.css';
import '../../node_modules/font-awesome/css/font-awesome.css';
import '../../node_modules/normalize.css/normalize.css';
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
      <Root>
        <Provider store={store}>
          <DndProvider backend={HTML5Backend}>
            <RouterProvider router={router} />
          </DndProvider>
        </Provider>
      </Root>
    </React.StrictMode>
  );
}
