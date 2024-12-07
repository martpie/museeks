/**
 * Pluralize a word
 */
export function plural(str: string, count: number) {
  return count === 1 ? str : `${str}s`;
}
