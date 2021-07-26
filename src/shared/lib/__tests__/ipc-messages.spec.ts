import messages from '../ipc-messages';

describe('messages', () => {
  test('should have unique keys, and each value should equal to its key', () => {
    Object.entries(messages).forEach(([key, value]) => {
      expect(key).toBe(value);
    });
  });
});
