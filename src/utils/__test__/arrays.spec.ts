import { expect } from 'chai';

import { chance } from '../../__test__/chance';

import { Arrays } from '../arrays';

describe('Utils(Arrays)', () => {
  describe('func(unique)', () => {
    it('should dedupe items in the array', () => {
      const first = chance.string();
      const second = chance.string();

      expect(Arrays.unique([first, first, second, first, second])).length(2);
    });
  });
});
