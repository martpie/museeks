import debounce from 'lodash-es/debounce';

function getKey() {
  return `scroll-${location.pathname}`;
}

export const saveScrollPosition = debounce(
  (y: number) => {
    globalThis.sessionStorage.setItem(getKey(), y.toString());
  },
  1000,
  {},
);

export const getScrollPosition = (): number => {
  return Number(globalThis.sessionStorage.getItem(getKey()));
};
