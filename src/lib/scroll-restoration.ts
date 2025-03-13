import debounce from 'lodash-es/debounce';

function getKey() {
  return `scroll-${location.pathname}`;
}

export const saveScrollPosition = debounce(
  (y: number) => {
    window.sessionStorage.setItem(getKey(), y.toString());
  },
  1000,
  {},
);

export const getScrollPosition = (): number => {
  return Number(window.sessionStorage.getItem(getKey()));
};
