import { expect } from 'chai';
import { Chance } from 'chance';

import { chance } from '../../__test__/chance';

describe('Utils(Chance)', () => {
  describe('const(chance)', () => {
    it('should export a chance class', () => {
      expect(chance).instanceOf(Chance);
    });
  });
});
