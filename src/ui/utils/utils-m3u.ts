import * as path from 'path';
import * as fs from 'fs';
import * as chardet from 'chardet';
import * as iconv from 'iconv-lite';

const isFile = (path: string) => fs.lstatSync(path).isFile();

export const parse = (filePath: string): string[] => {
  try {
    const baseDir = path.parse(filePath).dir;
    const encoding = chardet.detectFileSync(filePath);
    const content = fs.readFileSync(filePath);

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
      if (fs.existsSync(path.resolve(baseDir, line)) && isFile(path.resolve(baseDir, line))) {
        acc.push(path.resolve(baseDir, line));
        return acc;
      }

      return acc;
    }, [] as string[]);

    return files;
  } catch (err) {
    console.warn(err);
  }

  return [];
};
