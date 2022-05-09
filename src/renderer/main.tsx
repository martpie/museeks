/*
|--------------------------------------------------------------------------
| React and Router
|--------------------------------------------------------------------------
*/

import React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import Root from './Root';
import Router from './Router';
import store from './store/store';

/*
|--------------------------------------------------------------------------
| Styles
|--------------------------------------------------------------------------
*/

import '../../node_modules/normalize.css/normalize.css';
import '../../node_modules/font-awesome/css/font-awesome.css';
import '../../node_modules/react-rangeslider/lib/index.css';
import './styles/main.module.css';

/*
|--------------------------------------------------------------------------
| Render the app
|--------------------------------------------------------------------------
*/

ReactDOM.render(
  <React.StrictMode>
    <Root>
      <Provider store={store}>
        <DndProvider backend={HTML5Backend}>
          <Router />
        </DndProvider>
      </Provider>
    </Root>
  </React.StrictMode>,
  document.getElementById('wrap')
);
