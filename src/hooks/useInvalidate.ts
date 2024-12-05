import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useRevalidator } from 'react-router';

/**
 * Hook returning a function to be manually called after anything that represents
 * a mutation. Particularly useful if you cannot use `useInvalidate` in case you
 * need to pass a custom value to its callback, or if you are going to break the
 * rule of hooks.
 */
export default function useInvalidate() {
  const routerRevalidator = useRevalidator();
  const queryClient = useQueryClient();

  return useCallback(() => {
    //  Need to call mutate with undefined to make sure stale-while-revalidate is
    // reset (otherwise, we'd see a "no tracks in the library" instead of "loading")
    queryClient.invalidateQueries({
      exact: true,
      queryKey: ['tracks'],
    });

    // Reload the route data
    routerRevalidator.revalidate();
  }, [routerRevalidator, queryClient]);
}

// biome-ignore lint/suspicious/noExplicitAny: we don't care about the actual args
type AnyArgs = any[];
type Callback = (...args: AnyArgs) => Promise<void>;

/**
 * Helper hook to easily-wrap async mutations to reload routes data once its
 * callback is executed.
 */
export function useInvalidateCallback<T extends Callback>(callback: T): T {
  const invalidate = useInvalidate();

  return useCallback(
    async (...args: Parameters<T>) => {
      await callback(...args);
      invalidate();
    },
    [callback, invalidate],
  ) as T;
}
