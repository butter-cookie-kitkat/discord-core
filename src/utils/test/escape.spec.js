import { expect } from 'chai';

import { Escape } from '../escape';

describe('Utils(Escape)', () => {
  describe('func(regex)', () => {
    it('should escape any regex special characters tags', () => {
      const characters = '-/^$*+?.()|[]{}';

      expect(Escape.regex(characters)).equals(characters.replace(/./g, '\\$&'));
    });
  });
});
