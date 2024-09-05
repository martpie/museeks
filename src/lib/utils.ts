import * as logger from '@tauri-apps/plugin-log';

import useToastsStore from '../stores/useToastsStore';

/**
 * Friendly logging for caught errors
 * https://kentcdodds.com/blog/get-a-catch-block-error-message-with-typescript
 */
export function logAndNotifyError(
  err: unknown,
  pre?: string,
  isWarning = false,
  silent = false,
): void {
  let message;
  if (err instanceof Error) message = err.message;
  else message = String(err);

  if (pre != null) {
    message = `${pre}: ${message}`;
  }

  if (isWarning) {
    logger.warn(message);
  } else {
    logger.error(message);
  }

  if (silent === false) {
    useToastsStore.getState().api.add('danger', message);
  }
}
