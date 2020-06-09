import { expect } from 'chai';

import { chance } from '../../../test/chance';

import { Normalize } from '../normalize';
import { Escape } from '../escape';

describe('Utils(Normalize)', () => {
  describe('func(pattern)', () => {
    it('should support parsing strings into a pattern', () => {
      const command = chance.string();
      const arg = chance.string();

      const format = `${command} <${arg}>`
      expect(Normalize.pattern(format)).deep.equals({
        names: [{
          name: arg,
          rest: false,
        }],
        regex: new RegExp(`^${Escape.regex(command)} `, 'i'),
        original: format,
      });
    });

    it('should identify rest arguments', () => {
      const command = chance.string();
      const arg = chance.string();

      const format = `${command} <...${arg}>`
      expect(Normalize.pattern(format)).deep.equals({
        names: [{
          name: arg,
          rest: true,
        }],
        regex: new RegExp(`^${Escape.regex(command)} `, 'i'),
        original: format,
      });
    });
  });

  describe('func(patterns)', () => {
    it('should support parsing strings into a pattern', () => {
      const command = chance.string();
      const arg = chance.string();

      const formats = [
        `${command}`,
        `${command} <${arg}>`
      ];

      expect(Normalize.patterns(formats)).deep.equals([{
        names: [],
        regex: new RegExp(`^${Escape.regex(command)}`, 'i'),
        original: formats[0],
      }, {
        names: [{
          name: arg,
          rest: false,
        }],
        regex: new RegExp(`^${Escape.regex(command)} `, 'i'),
        original: formats[1],
      }]);
    });
  });

  describe('func(help)', () => {
    it('should default the arg type to string', () => {
      const options = {
        name: chance.string(),
        description: chance.string(),
        group: chance.string(),
        args: {
          name: chance.string(),
        },
      };

      expect(Normalize.help(options)).deep.equals({
        ...options,
        args: {
          name: {
            description: options.args.name,
            type: 'string',
          },
        },
      });
    });

    it('should support specifying the type', () => {
      const options = {
        name: chance.string(),
        description: chance.string(),
        group: chance.string(),
        args: {
          name: {
            description: chance.string(),
            type: chance.pickone(['string', 'boolean', 'number']),
          },
        },
      };

      expect(Normalize.help(options)).deep.equals(options);
    });
  });
});
