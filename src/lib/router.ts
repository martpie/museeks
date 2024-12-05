import { createHashRouter } from 'react-router-dom';
import routeTree from './route-tree';

const router = createHashRouter(routeTree, {
  future: {
    v7_partialHydration: true,
  },
});

export default router;
