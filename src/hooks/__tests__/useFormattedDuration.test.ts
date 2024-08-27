import { describe, expect, test } from 'bun:test';

import { parseDuration } from '../useFormattedDuration';

describe('parseDuration', () => {
  test('should return a duration as a human-friendly string', () => {
    expect(parseDuration(0)).toStrictEqual('00:00');
    expect(parseDuration(1)).toStrictEqual('00:01');
    expect(parseDuration(10)).toStrictEqual('00:10');
    expect(parseDuration(60)).toStrictEqual('01:00');
    expect(parseDuration(695)).toStrictEqual('11:35');
    expect(parseDuration(7261)).toStrictEqual('02:01:01');
    expect(parseDuration(9999999)).toStrictEqual('2777:46:39');
  });
});
