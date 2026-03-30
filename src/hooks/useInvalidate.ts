import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { useCallback } from 'react';

import { allTracksQuery, librarySortQuery } from '../lib/queries';
import { logAndNotifyError } from '../lib/utils';

/**
 * Hook returning a function to be manually called after anything that represents
 * a mutation. Particularly useful if you cannot use `useInvalidate` in case you
 * need to pass a custom value to its callback, or if you are going to break the
 * rule of hooks.
 */
export default function useInvalidate() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useCallback(async () => {
    return Promise.allSettled([
      // Invalidate queries so data is refetched and the UI shows a loading state
      // instead of a misleading "no tracks in the library" message
      queryClient.invalidateQueries({ queryKey: allTracksQuery.queryKey }),
      queryClient.invalidateQueries({ queryKey: librarySortQuery.queryKey }),
      // Reload the route data
      router.invalidate(),
    ]);
  }, [queryClient, router]);
}

type AnyArgs = any[];
type Callback = (...args: AnyArgs) => Promise<void>;

/**
 * Helper hook to easily-wrap async mutations to reload routes data once its
 * callback is executed.
 */
export function useInvalidateCallback<T extends Callback>(
  callback: T,
): (...args: Parameters<T>) => Promise<void> {
  const invalidate = useInvalidate();

  return useCallback(
    async (...args: Parameters<T>) => {
      await callback(...args)
        .catch(logAndNotifyError)
        .finally(invalidate);
    },
    [callback, invalidate],
  );
}
