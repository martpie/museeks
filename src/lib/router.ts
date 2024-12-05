import { createHashRouter } from 'react-router';
import routeTree from './route-tree';

const router = createHashRouter(routeTree);

export default router;
