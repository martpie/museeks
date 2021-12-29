import path from 'path';
import fs from 'fs';
import * as mmd from 'music-metadata';
import globby from 'globby';

const SUPPORTED_COVER_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.bmp', '.gif'];
const SUPPORTED_COVER_NAMES = ['album', 'albumart', 'folder', 'cover', 'front'];

/**
 * Parse data to be used by img/background-image with base64
 */
export const parseBase64 = (format: string, data: string): string => {
  return `data:${format};base64,${data}`;
};

/**
 * Determine if a file is a valid cover or not
 */
const isValidFilename = (pathname: path.ParsedPath): boolean => {
  const isExtensionValid = SUPPORTED_COVER_EXTENSIONS.includes(pathname.ext.toLowerCase());
  const isNameValid = SUPPORTED_COVER_NAMES.some((name) => {
    return pathname.name.toLowerCase().includes(name);
  });

  return isExtensionValid && isNameValid;
};

/**
 * Smart fetch cover (from id3 or file directory)
 */
export const fetchCover = async (trackPath: string, ignoreId3 = false, base64 = false): Promise<string | null> => {
  if (!trackPath) {
    return null;
  }

  if (!ignoreId3) {
    const data = await mmd.parseFile(trackPath);
    const picture = data.common.picture && data.common.picture[0];

    if (picture) {
      // If cover in id3
      return parseBase64(picture.format, picture.data.toString('base64'));
    }
  }

  // scan folder for any cover image
  const folder = path.dirname(trackPath);
  const pattern = `${folder.replace(/\\/g, '/')}/*`;

  const matches = await globby(pattern, { followSymbolicLinks: false });

  const match = matches.find((elem) => {
    return isValidFilename(path.parse(elem));
  });

  if (match) {
    if (base64) return getFileAsBase64(match);

    return match;
  }

  return null;
};

/**
 * Returns the given file as a base64 string
 */
export const getFileAsBase64 = async (filePath: string): Promise<string | null> => {
  try {
    const content = fs.readFileSync(filePath, { encoding: 'base64' });
    return parseBase64(path.extname(filePath).substr(1), content);
  } catch {
    return null;
  }
};
