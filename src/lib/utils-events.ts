export function isLeftClick(e: React.MouseEvent): boolean {
  return e.button === 0;
}

export function isRightClick(e: React.MouseEvent): boolean {
  return e.button === 2;
}

/**
 * Stop the propagation of an event
 */
export function stopPropagation(e: React.SyntheticEvent) {
  e.stopPropagation();
}

/**
 * Prevent the default behavior of an event
 */
export function preventNativeDefault(e: Event) {
  e.preventDefault();
}

/**
 * Check if we are running in a dev environment
 */
export function isDev() {
  return window.location.host.startsWith('localhost:');
}

/**
 * Returns true if
 * - the control key was pressed on a non-mac platform
 * - the cmd key is pressed on macOS
 */
export function isCtrlKey(
  e: React.KeyboardEvent | React.MouseEvent | KeyboardEvent,
): boolean {
  const isMacOS = window.__MUSEEKS_PLATFORM === 'macos';

  return (isMacOS && e.metaKey) || (!isMacOS && e.ctrlKey);
}

/**
 * Returns true if
 * - the alt key was pressed on a non-mac platform
 * - the option key is pressed on macOS
 */
export function isAltKey(
  e: React.KeyboardEvent | React.MouseEvent | KeyboardEvent,
): boolean {
  const isMacOS = window.__MUSEEKS_PLATFORM === 'macos';

  return (isMacOS && e.ctrlKey) || (!isMacOS && e.metaKey);
}

/**
 * Returns true if no modifier was pressed during an event
 */
export function isKeyWithoutModifiers(
  e: React.KeyboardEvent | React.MouseEvent | KeyboardEvent,
): boolean {
  return !e.metaKey && !e.ctrlKey && !e.shiftKey;
}
