import debounce from 'lodash-es/debounce';
import { useEffect, useState } from 'react';
import { useLocation, useNavigation } from 'react-router';

function getScrollPosition(key: string) {
  const pos = window.sessionStorage.getItem(key);
  return Number(pos) || 0;
}

const setScrollPosition = debounce(function setScrollPosition(
  key: string,
  pos: number,
) {
  window.sessionStorage.setItem(key, pos.toString());
}, 100);

/**
 * Given a ref to a scrolling container element, keep track of its scroll
 * position before navigation and restore it on return (e.g., back/forward nav).
 *
 * Inspired by:
 * https://github.com/remix-run/react-router/pull/10468#issuecomment-1877312374
 *
 * Except we want to use location.pathname, and not location.key
 */
export function useScrollRestoration(
  container: React.RefObject<HTMLElement | null>,
) {
  const [init, setInit] = useState(false); // React strick mode is a nightmare
  const key = `scroll-position-${useLocation().pathname}`;
  const { state } = useNavigation();
  const target = container?.current;

  useEffect(() => {
    function onScroll() {
      setScrollPosition(key, target?.scrollTop ?? 0);
    }

    target?.addEventListener('scroll', onScroll);

    return () => {
      target?.removeEventListener('scroll', onScroll);
    };
  }, [target, key]);

  useEffect(() => {
    if (state === 'idle' && !init) {
      setInit(true);
      target?.scrollTo(0, getScrollPosition(key));
    }
  }, [key, state, target, init]);
}
