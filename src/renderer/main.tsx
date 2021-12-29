/*
|--------------------------------------------------------------------------
| React and Router
|--------------------------------------------------------------------------
*/

import React from 'react';
import * as ReactDOM from 'react-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Provider as ReduxProvider } from 'react-redux';
import { I18nextProvider } from 'react-i18next';

import Root from './Root';
import Router from './Router';
import store from './store/store';
import i18n from './lib/i18n';

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

i18n
  .init()
  .then(() => {
    ReactDOM.render(
      <Root>
        <ReduxProvider store={store}>
          <DndProvider backend={HTML5Backend}>
            <I18nextProvider i18n={i18n}>
              <Router />
            </I18nextProvider>
          </DndProvider>
        </ReduxProvider>
      </Root>,
      document.getElementById('wrap')
    );
  })
  .catch((err: unknown) => {
    throw new Error(`Failed to initialize i18next:\n${err}`);
  });
