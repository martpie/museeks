import path from 'path';
import fs from 'fs';

import chardet from 'chardet';
import iconv from 'iconv-lite';

import logger from '../../shared/lib/logger';

const isFile = (path: string) => fs.lstatSync(path).isFile();

/**
 * Analyze a .m3u file and returns the resolved path of each song from it
 */
export const parse = (filePath: string): string[] => {
  try {
    const baseDir = path.parse(filePath).dir;
    const content = fs.readFileSync(filePath);
    const encoding = chardet.detect(content);

    if (typeof encoding !== 'string') {
      throw new Error(`could not guess the file encoding (${filePath})`);
    }

    const decodedContent = iconv.decode(content, encoding);

    const files = decodedContent.split(/\r?\n/).reduce((acc, line) => {
      if (line.length === 0) {
        return acc;
      }

      // If absolute path
      if (fs.existsSync(path.resolve(line)) && isFile(path.resolve(line))) {
        acc.push(path.resolve(line));
        return acc;
      }

      // If relative Path
      if (
        fs.existsSync(path.resolve(baseDir, line)) &&
        isFile(path.resolve(baseDir, line))
      ) {
        acc.push(path.resolve(baseDir, line));
        return acc;
      }

      return acc;
    }, [] as string[]);

    return files;
  } catch (err) {
    logger.warn(err);
  }

  return [];
};
