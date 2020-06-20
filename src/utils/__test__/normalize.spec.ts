import { expect } from 'chai';

import { chance } from '../../__test__/chance';

import { Normalize } from '../normalize';
import { Command } from '../../command';

describe('Utils(Normalize)', () => {
  describe('func(pattern)', () => {
    it('should support parsing strings into a pattern', () => {
      const command = chance.word();
      const arg = chance.word();

      const format = `${command} <${arg}>`
      expect(Normalize.pattern(format)).deep.equals({
        names: [{
          name: arg,
          rest: false,
        }],
        regex: new RegExp(`^${command} ([^\\s]+)`, 'i'),
        original: format,
      });
    });

    it('should identify rest arguments', () => {
      const command = chance.word();
      const arg = chance.word();

      const format = `${command} <...${arg}>`
      expect(Normalize.pattern(format)).deep.equals({
        names: [{
          name: arg,
          rest: true,
        }],
        regex: new RegExp(`^${command} (.+)`, 'i'),
        original: format,
      });
    });
  });

  describe('func(patterns)', () => {
    it('should support parsing strings into a pattern', () => {
      const command = chance.word();
      const arg = chance.word();

      const formats = [
        `${command}`,
        `${command} <${arg}>`,
      ];

      expect(Normalize.patterns(formats)).deep.equals([{
        names: [],
        regex: new RegExp(`^${command}`, 'i'),
        original: formats[0],
      }, {
        names: [{
          name: arg,
          rest: false,
        }],
        regex: new RegExp(`^${command} ([^\\s]+)`, 'i'),
        original: formats[1],
      }]);
    });
  });

  describe('func(help)', () => {
    it('should default the arg type to string', () => {
      const options = {
        name: chance.word(),
        description: chance.word(),
        group: chance.word(),
        args: {
          name: chance.word(),
        },
      };

      expect(Normalize.help(options, [])).deep.equals({
        ...options,
        args: {
          name: {
            name: 'name',
            description: options.args.name,
            type: 'string',
            positional: false,
          },
        },
      });
    });

    it('should support specifying the type', () => {
      const options = {
        name: chance.word(),
        description: chance.word(),
        group: chance.word(),
        args: {
          name: {
            name: 'name',
            description: chance.word(),
            type: chance.pickone(['string', 'boolean', 'number']) as Command.ArgumentTypeKeys,
            positional: false,
          },
        },
      };

      expect(Normalize.help(options, [])).deep.equals(options);
    });

    it('should support positionals', () => {
      const options = {
        name: chance.word(),
        description: chance.word(),
        group: chance.word(),
        args: {
          name: chance.word(),
        },
      };

      expect(Normalize.help(options, [{
        names: [{
          name: 'name',
          rest: true,
        }],
        regex: /^$/i,
        original: '',
      }])).deep.equals({
        ...options,
        args: {
          name: {
            name: 'name',
            description: options.args.name,
            type: 'string',
            positional: true,
          },
        },
      });
    });
  });
});
