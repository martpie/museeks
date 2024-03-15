import { QueryClient } from '@tanstack/react-query';

import router from '../views/router';

export const queryClient = new QueryClient();

export function invalidate() {
  // Need to call mutate with undefined to make sure stale-while-revalidate is
  // reset (otherwise, we'd see a "no tracks in the library" instead of "loading")
  queryClient.invalidateQueries({
    exact: true,
    queryKey: ['tracks'],
  });

  // Reload the route data
  router.revalidate();
}
