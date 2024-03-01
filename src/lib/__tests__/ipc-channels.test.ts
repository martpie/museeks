import { describe, test, expect } from 'vitest';

import channels from '../ipc-channels';

describe('messages', () => {
  test('should have unique keys, and each value should equal to its key', () => {
    Object.entries(channels).forEach(([key, value]) => {
      expect(key).toBe(value);
    });
  });
});
