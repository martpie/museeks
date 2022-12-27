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

import '../../node_modules/react-rangeslider/lib/index.css';
import '../../node_modules/font-awesome/css/font-awesome.css';
import '../../node_modules/normalize.css/normalize.css';

import Root from './Root';
import Router from './Router';
import store from './store/store';

/*
|--------------------------------------------------------------------------
| Styles
|--------------------------------------------------------------------------
*/

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
            <Router />
          </DndProvider>
        </Provider>
      </Root>
    </React.StrictMode>
  );
}
