import { describe, expect, test } from 'bun:test';
import { plural } from '../localization';

describe('localization', () => {
  describe('plural', () => {
    test("should add a 's' to strings with a count of 0 or 2 or more", () => {
      expect(plural('album', 0)).toEqual('albums');
      expect(plural('album', 2)).toEqual('albums');
      expect(plural('album', 3)).toEqual('albums');
      expect(plural('album', 10)).toEqual('albums');
      expect(plural('track', 10)).toEqual('tracks');
    });

    test("should not add a 's' to strings with a count of 1", () => {
      expect(plural('album', 1)).toEqual('album');
      expect(plural('track', 1)).toEqual('track');
    });
  });
});
