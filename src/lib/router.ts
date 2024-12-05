import { createHashRouter } from 'react-router-dom';
import routeTree from './route-tree';

const router = createHashRouter(routeTree, {
  future: {
    v7_partialHydration: true,
    v7_normalizeFormMethod: true,
    v7_fetcherPersist: true,
    v7_skipActionErrorRevalidation: true,
  },
});

export default router;
