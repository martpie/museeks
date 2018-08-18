import electron from 'electron';

const { shell } = electron;

/**
 * Open a URL externally (e.g in the browser)
 */
export const openExternal = (url: string) => {
  shell.openExternal(url);
};
