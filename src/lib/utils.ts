import { error } from '@tauri-apps/plugin-log';

import useToastsStore from '../stores/useToastsStore';

/**
 * Parse an int to a more readable string
 */
export const parseDuration = (duration: number | null): string => {
  if (duration !== null) {
    const hours = Math.trunc(duration / 3600);
    const minutes = Math.trunc(duration / 60) % 60;
    const seconds = Math.trunc(duration) % 60;

    const hoursStringified = hours < 10 ? `0${hours}` : hours;
    const minutesStringified = minutes < 10 ? `0${minutes}` : minutes;
    const secondsStringified = seconds < 10 ? `0${seconds}` : seconds;

    let result = hours > 0 ? `${hoursStringified}:` : '';
    result += `${minutesStringified}:${secondsStringified}`;

    return result;
  }

  return '00:00';
};

/**
 * Friendly logging for caught errors
 * https://kentcdodds.com/blog/get-a-catch-block-error-message-with-typescript
 */
export const logAndNotifyError = (err: unknown): void => {
  let message;
  if (err instanceof Error) message = err.message;
  else message = String(err);
  error(message);
  useToastsStore.getState().api.add('danger', message);
};
