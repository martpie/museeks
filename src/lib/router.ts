import { createHashRouter } from 'react-router-dom';
import routeTree from './route-tree';

const router = createHashRouter(routeTree);

export default router;
