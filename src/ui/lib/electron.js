import electron from 'electron';

const { shell } = electron; // electron is currently stored in a global variable

/**
 * Open a URL externally (e.g in the browser)
 *
 * @param {string} url
 */
export const openExternal = (url) => {
  shell.openExternal(url);
};
