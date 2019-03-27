import * as path from 'path';
import * as mmd from 'music-metadata';
import globby from 'globby';

/**
 * Parse data to be used by img/background-image with base64
 */
export const parseBase64 = (format: string, data: string) => {
  return `data:${format};base64,${data}`;
};

/**
 * Smart fetch cover
 */
export const fetchCover = async (trackPath: string, ignoreBase64 = false): Promise<string | null> => {
  if (!trackPath) {
    return null;
  }

  const data = await mmd.parseFile(trackPath);
  const picture = data.common.picture && data.common.picture[0];

  if (picture && !ignoreBase64) { // If cover in id3
    return parseBase64(picture.format, picture.data.toString('base64'));
  }

  // scan folder for any cover image
  const folder = path.dirname(trackPath);
  const pattern = path.join(folder, '*');
  const matches = await globby(pattern, { followSymlinkedDirectories: false });

  const match = matches.find((elem) => {
    const parsedPath = path.parse(elem);

    return ['album', 'albumart', 'folder', 'cover'].includes(parsedPath.name.toLowerCase())
      && ['.png', '.jpg', '.bmp', '.gif'].includes(parsedPath.ext.toLowerCase()); // TODO jpeg?
  });

  if (match) return match;

  return null;
};
