import parser from 'yargs-parser';
import DiscordJS from 'discord.js';

import { Normalize } from './utils/normalize';

/**
 * @typedef {Object} NormalizedConfig
 * @property {import('./utils/normalize').Pattern[]} patterns - the pattern to listen for.
 * @property {Listener} listener - the listener to invoke when the pattern is matched.
 */

/**
 * @typedef {Object} Config
 * @property {string|string[]} patterns - the pattern to listen for.
 * @property {Listener} listener - the listener to invoke when the pattern is matched.
 */

/**
 * @typedef {Object} HelpOptions.Arg
 * @property {string} name - the name of the command.
 * @property {string} type - the argument type.
 * @property {any} default - the default value.
 * @property {string} description - a description of the argument.
 * @property {boolean} [positional] - true if this is an inline argument.
 */

/**
 * @typedef {Object} HelpOptions
 * @property {string} name - the name of the command.
 * @property {string} group - the commands group.
 * @property {string} description - the commands description.
 * @property {Object<string, (string|HelpOptions.Arg)>} args - a map describing each of the arguments.
 */

/**
 * @typedef {Object} NormalizedHelpOptions
 * @property {string} name - the name of the command.
 * @property {string} group - the commands group.
 * @property {string} description - the commands description.
 * @property {string} example - the example pattern.
 * @property {Object<string, HelpOptions.Arg>} args - a map describing each of the arguments.
 */

/**
 * @typedef {Object} Listener.Info
 * @property {DiscordJS.Message} message - the discord.js message.
 * @property {Object<string, any>} args - the arguments provided to the command.
 */

/**
 * @callback Listener
 * @param {Listener.Info}
 * @returns {Promise<void>}
 */

export const TYPES = {
  boolean: Boolean,
  number: Number,
  string: String,
}

export class Command {
  /**
   * @type {NormalizedConfig} the configuration.
   */
  #config;

  /**
   * @type {NormalizedHelpOptions} the help options for the given command.
   */
  #help;

  /**
   * @type {import('yargs-parser').Options} the yargs equivalent to our help config.
   */
  #yargs;

  /**
   * @param {Config} config - the configuration.
   */
  constructor(config) {
    this.#config = {
      ...config,
      patterns: Normalize.patterns(config.patterns),
    };
  }

  /**
   * Checks if the message matches the commands pattern.
   *
   * @param {string} content - the message to test.
   * @returns {import('./utils/normalize').Pattern} the matching pattern.
   */
  match(content) {
    return this.#config.patterns
      .filter(({ regex }) => content.match(regex))
      .reduce((closestPattern, pattern) => !closestPattern || pattern.regex.toString().length > closestPattern.regex.toString().length ? pattern : closestPattern, null);
  }

  #coerce = (type, value) => {
    const Type = TYPES[type];

    if (!Type) {
      throw new Error(`Unable to coerce the given type. (${type})`);
    }

    return value ? Type(value) : value;
  }

  /**
   * Parses the message and extracts the arguments.
   *
   * @param {DiscordJS.Message} content - the message to parse.
   * @returns {Object<string, string>} - the arguments passed to the message
   */
  parse(content) {
    const pattern = this.match(content);

    if (!pattern) {
      throw new Error(`Given message isn't intended for this command. (${content})`);
    }

    const args = parser(content, {
      ...this.#yargs,
      configuration: {
        'unknown-options-as-args': true,
      },
    });

    const unknowns = args._.filter((arg) => arg.startsWith('-'));

    if (unknowns.length > 0) {
      throw new Error(`Unknown arguments. ('${unknowns.join(`','`)}')`);
    }

    const [, ...groups] = args._;

    return Object.entries(this.#help.args).reduce((output, [name, arg]) => {
      const positionalIndex = pattern.names.findIndex(({ name: patternName }) => name === patternName);

      let value;
      if (positionalIndex === -1) {
        value = args[name];
      } else if (pattern.names[positionalIndex].rest) {
        value = groups.slice(positionalIndex).join(' ');
      } else {
        value = groups[positionalIndex];
      }

      output[name] = this.#coerce(arg.type, value || arg.default || null);
      return output;
    }, {});
  }

  /**
   * Returns whether the given argument is positional.
   *
   * @param {string} searchName - the name of the argument to test.
   * @returns {boolean} if the argument is positional.
   */
  positional(searchName) {
    return Boolean(this.#config.patterns.find((pattern) => pattern.names.some(({ name }) => searchName === name)));
  }

  /**
   * Executes the command.
   *
   * @param {Listener.Info} info - the command information.
   * @returns {Promise<void>} the promise resolved by the listener
   */
  async exec(info) {
    await this.#config.listener(info);
  }

  /**
   * @param {HelpOptions} options - the help options for the given command.
   *
   * @returns {NormalizedHelpOptions} the help options.
   */
  help(options) {
    if (options !== undefined) {
      this.#help = Normalize.help(options);

      for (const key of Object.keys(this.#help.args)) {
        this.#help.args[key].positional = this.positional(key);
      }

      this.#yargs = Object.entries(this.#help.args).reduce((output, [name, arg]) => {
        if (!arg.positional) {
          output[arg.type].push(name);

          if (arg.alias) {
            output.alias[name] = arg.alias;
          }

          if (arg.default) {
            output.default[name] = arg.default;
          }
        }

        return output;
      }, {
        array: [],
        boolean: [],
        number: [],
        string: [],
        alias: {},
        default: {},
      });
    }

    const [firstPattern] = this.#config.patterns;

    return {
      ...this.#help,
      example: `.${firstPattern.original}`,
    };
  }
}
