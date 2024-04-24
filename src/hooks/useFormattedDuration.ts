import { useMemo } from 'react';

/**
 * Parse an int to a more readable string
 */
export function parseDuration(maybe_duration: number | null): string {
  if (maybe_duration !== null && !Number.isNaN(maybe_duration)) {
    const duration = Math.trunc(maybe_duration);
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
}

/**
 * Memoize a formatted duration for a given number
 */
export default function useFormattedDuration(duration: number | null): string {
  const durationAsSeconds = duration !== null ? Math.trunc(duration) : null;

  const display = useMemo(() => {
    return parseDuration(durationAsSeconds);
  }, [durationAsSeconds]);

  return display;
}
