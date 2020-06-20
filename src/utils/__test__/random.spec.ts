import { expect } from 'chai';

import { random } from '../random';

describe('Utils(Random)', () => {
  describe('func(integer)', () => {
    it('should be an integer', () => {
      const result = random.integer(1, 20);

      expect(result.toString()).equals(result.toFixed(0));
    });

    it('should support being the minimum', () => {
      const min = 1;
      const max = 5;

      expect(Array(1000).fill(null).some(() => random.integer(min, max) === min)).equals(true);
    });

    it('should support being the maximum', () => {
      const min = 1;
      const max = 5;

      expect(Array(1000).fill(null).some(() => random.integer(min, max) === max)).equals(true);
    });

    it('should always be between the min and max', () => {
      const min = 1;
      const max = 20;

      for (let i = 0; i < 1000; i++) {
        const result = random.integer(min, max)

        expect(result).gte(min);
        expect(result).lte(max);
      }
    });
  });

  describe('func(pickone)', () => {
    it('should randomly pick an item', () => {
      const result = random.pickone(Array(1000).fill(0).map((_, i) => i));

      expect(result).exist;
      expect(result).is.a('number');
    });

    it('should support empty lists', () => {
      const result = random.pickone([]);

      expect(result).not.exist;
    });
  });
});
