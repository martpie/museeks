import { mutate } from 'swr';

import router from '../views/router';

export function invalidate() {
  // Need to call mutate with undefined to make sure stale-while-revalidate is
  // reset (otherwise, we'd see a "no tracks in the library" instead of "loading")
  mutate('tracks', undefined);

  // Reload the route data
  router.revalidate();
}
