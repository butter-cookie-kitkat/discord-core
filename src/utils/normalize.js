/**
 * @typedef {Object} Name
 * @property {string} name - the name of the param.
 * @property {boolean} rest - whether this param should include the remaining positional args.
 */

import { Escape } from "./escape";

/**
 * @typedef {Object} Pattern
 * @property {Name[]} names - the list of positional argument names
 * @property {RegExp} regex - the pattern's regular expression.
 * @property {string} original - the original format string.
 */

export class Normalize {
  /**
   * Normalizes the pattern formats into a common format.
   *
   * @param {string[]|string} formats - the formats to normalize.
   * @returns {Pattern[]} a collection of normalized patterns.
   */
  static patterns(formats) {
    if (Array.isArray(formats)) {
      return formats.map((format) => Normalize.pattern(format));
    }

    return [Normalize.pattern(formats)];
  }

  /**
   * Normalizes the pattern format into a common pattern.
   *
   * @param {string} format - the format to normalize.
   * @returns {Pattern} a collection of normalized patterns.
   */
  static pattern(format) {
    const names = [];

    const regex = new RegExp(`^${Escape.regex(format).replace(/<([^<>]+)>/g, (_, name) => {
      const rest = name.startsWith('...');
      names.push({
        name: rest ? name.replace(/^[.]{3}/, '') : name,
        rest,
      });

      return '([^\\s]+)';
    })}`, 'i');

    return {
      names,
      regex,
      original: format,
    };
  }

  static help(options) {
    return {
      name: options.name,
      description: options.description,
      group: options.group,
      args: Object.entries(options.args || {}).reduce((output, [key, value]) => {
        output[key] = typeof(value) === 'object' ? value : {
          description: value,
          type: 'string',
        };
        return output;
      }, {}),
    };
  }
}
