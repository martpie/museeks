import os from 'os';
import path from 'path';

/**
 * Parse an URI, encoding some characters
 */
export const parseUri = (uri: string): string => {
  // path and os should not be used
  const root = os.platform() === 'win32' ? '' : path.parse(uri).root;

  const location = path
    .resolve(uri)
    .split(path.sep)
    .map((d, i) => (i === 0 ? d : encodeURIComponent(d)))
    .reduce((a, b) => path.join(a, b));

  return `file://${root}${location}`;
};
