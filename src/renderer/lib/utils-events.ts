import { getPlatform } from './utils-xplat';

export const isLeftClick = (e: React.MouseEvent): boolean => e.button === 0;
export const isRightClick = (e: React.MouseEvent): boolean => e.button === 2;

/**
 * Returns true if
 * - the control key was pressed on a non-mac platform
 * - the cmd key is pressed on macOS
 */
export const isCtrlKey = (e: React.KeyboardEvent | React.MouseEvent | KeyboardEvent): boolean => {
  const isMacOS = getPlatform() === 'darwin';

  return (isMacOS && e.metaKey) || (!isMacOS && e.ctrlKey);
};

export const isAltKey = (e: React.KeyboardEvent | React.MouseEvent | KeyboardEvent): boolean => {
  const isMacOS = getPlatform() === 'darwin';

  return (isMacOS && e.ctrlKey) || (!isMacOS && e.metaKey);
};
