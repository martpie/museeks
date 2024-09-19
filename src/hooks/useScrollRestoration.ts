import { useEffect } from 'react';
import { useLocation, useNavigation } from 'react-router-dom';

function getScrollPosition(key: string) {
  const pos = window.sessionStorage.getItem(key);
  return Number(pos) || 0;
}

function setScrollPosition(key: string, pos: number) {
  window.sessionStorage.setItem(key, pos.toString());
}

/**
 * Given a ref to a scrolling container element, keep track of its scroll
 * position before navigation and restore it on return (e.g., back/forward nav).
 *
 * Inspired by:
 * https://github.com/remix-run/react-router/pull/10468#issuecomment-1877312374
 *
 * Except we want to use location.pathname, and not location.key
 */
export function useScrollRestoration(container: React.RefObject<HTMLElement>) {
  const key = `scroll-position-${useLocation().pathname}`;
  const { state } = useNavigation();

  useEffect(() => {
    function onScroll() {
      setScrollPosition(key, container.current?.scrollTop ?? 0);
    }

    container.current?.addEventListener('scroll', onScroll);

    return () => {
      container.current?.removeEventListener('scroll', onScroll);
    };
  });

  useEffect(() => {
    if (state === 'idle') {
      container.current?.scrollTo(0, getScrollPosition(key));
    }
  }, [key, state, container]);
}
