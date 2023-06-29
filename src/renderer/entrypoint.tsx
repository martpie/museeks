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
import { ErrorBoundary } from 'react-error-boundary';

import * as ViewMessage from './elements/ViewMessage/ViewMessage';
import ExternalLink from './elements/ExternalLink/ExternalLink';
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
      <ErrorBoundary
        fallback={
          <ViewMessage.Notice>
            <p>
              <span role="img" aria-label="boom">
                💥
              </span>{' '}
              Something wrong happened
            </p>
            <ViewMessage.Sub>
              If it happens again, please{' '}
              <ExternalLink href="https://github.com/martpie/museeks/issues">
                report an issue
              </ExternalLink>
            </ViewMessage.Sub>
          </ViewMessage.Notice>
        }
      >
        <DndProvider backend={HTML5Backend}>
          <RouterProvider router={router} />
        </DndProvider>
      </ErrorBoundary>
    </React.StrictMode>,
  );
}
