import * as os from 'os';


/**
 * Returns true if
 * - the control key was pressed on a non-mac platform
 * - the cmd key is pressed on macOS
 */
export const isCtrlKey = (e: React.KeyboardEvent | React.MouseEvent): boolean => {
  const isMacOS = os.platform() === 'darwin';

  return (isMacOS && e.metaKey)
    || (!isMacOS && e.ctrlKey);
};
