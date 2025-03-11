import { type RouteObject, createHashRouter } from 'react-router';

import GlobalErrorBoundary from './components/GlobalErrorBoundary';

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function convert(m: any) {
  const { clientLoader, clientAction, default: Component, ...rest } = m;
  return {
    ...rest,
    loader: clientLoader,
    action: clientAction,
    Component,
  };
}

const routeTree: RouteObject[] = [
  {
    path: '/',
    id: 'root',
    lazy: () => import('./routes/index').then(convert),
    HydrateFallback: () => null, // there should be no hydration as we're SPA-only
    ErrorBoundary: GlobalErrorBoundary,
    children: [
      {
        path: 'library',
        id: 'library',
        lazy: () => import('./routes/library').then(convert),
      },
      {
        path: 'playlists',
        id: 'playlists',
        lazy: () => import('./routes/playlists').then(convert),
        children: [
          {
            path: ':playlistID',
            id: 'playlist-details',
            lazy: () => import('./routes/playlist-details').then(convert),
          },
        ],
      },
      {
        path: 'settings',
        id: 'settings',
        lazy: () => import('./routes/settings').then(convert),
        children: [
          {
            path: 'library',
            lazy: () => import('./routes/settings-library').then(convert),
          },
          {
            path: 'interface',
            lazy: () => import('./routes/settings-ui').then(convert),
          },
          {
            path: 'audio',
            lazy: () => import('./routes/settings-audio').then(convert),
          },
          {
            path: 'about',
            lazy: () => import('./routes/settings-about').then(convert),
          },
        ],
      },
      {
        path: 'details/:trackID',
        lazy: () => import('./routes/track-details').then(convert),
      },
    ],
  },
];

const router = createHashRouter(routeTree);

export default router;
