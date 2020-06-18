import parser, { Options as YargsOptions } from 'yargs-parser';
import { Message } from 'discord.js';

import { Normalize } from './utils/normalize';

export const TYPES = {
  boolean: Boolean,
  number: Number,
  string: String,
};

export class Command {
  private config: Command.ConfigInternal;
  private helpConfig?: Command.HelpInternal;
  private yargs?: YargsOptions;

  constructor(config: Command.Config) {
    this.config = {
      ...config,
      patterns: Normalize.patterns(config.patterns),
    };
  }

  /**
   * Checks if the message matches the commands pattern.
   *
   * @param content - the message to test.
   * @returns the matching pattern.
   */
  public match(content: string): (null|Command.Pattern) {
    return this.config.patterns
      .filter(({ regex }) => content.match(regex))
      .reduce((closestPattern: (null|Command.Pattern), pattern: Command.Pattern): Command.Pattern => {
        if (!closestPattern || pattern.regex.toString().length > closestPattern.regex.toString().length) {
          return pattern;
        }

        return closestPattern;
      }, null);
  }

  private coerce(type: Command.ArgumentTypeKeys, value: string) {
    const Type = TYPES[type];

    if (!Type) {
      throw new Error(`Unable to coerce the given type. (${type})`);
    }

    return value ? Type(value) : value;
  }

  /**
   * Parses the message and extracts the arguments.
   *
   * @param content - the message to parse.
   */
  parse(content: string): { [key: string]: any } {
    const pattern = this.match(content);

    if (!pattern) {
      throw new Error(`Given message isn't intended for this command. (${content})`);
    }

    const args = parser(content, {
      ...this.yargs,
      configuration: {
        'unknown-options-as-args': true,
      },
    });

    const unknowns = args._.filter((arg) => arg.startsWith('-'));

    if (unknowns.length > 0) {
      throw new Error(`Unknown arguments. ('${unknowns.join(`','`)}')`);
    }

    const [, ...groups] = args._;

    if (this.helpConfig) {
      return Object.entries(this.helpConfig.args).reduce((output, [name, arg]) => {
        const positionalIndex = pattern.names.findIndex(({ name: patternName }) => name === patternName);

        let value;
        if (positionalIndex === -1) {
          value = args[name];
        } else if (pattern.names[positionalIndex].rest) {
          value = groups.slice(positionalIndex).join(' ');
        } else {
          value = groups[positionalIndex];
        }

        output[name] = this.coerce(arg.type, value || arg.default || null);
        return output;
      }, {} as {
        [key: string]: any;
      });
    }

    return {};
  }

  /**
   * Executes the command.
   *
   * @param info - the command information.
   * @returns the promise resolved by the listener.
   */
  public async exec(info: Command.ListenerInfo): Promise<void> {
    await this.config.listener(info);
  }

  /**
   * @param options - the help options for the given command.
   *
   * @returns the help options.
   */
  public help(options?: Command.Help): (null|Command.HelpInternal) {
    if (options !== undefined) {
      this.helpConfig = Normalize.help(options, this.config.patterns);

      this.yargs = Object.entries(this.helpConfig.args).reduce((output, [name, arg]) => {
        if (!arg.positional) {
          output[arg.type].push(name);

          if (arg.default) {
            output.default[name] = arg.default;
          }
        }

        return output;
      }, {
        array: [] as string[],
        boolean: [] as string[],
        number: [] as string[],
        string: [] as string[],
        default: {} as { [key: string]: any; },
      });
    }

    const [firstPattern] = this.config.patterns;

    if (this.helpConfig) {
      return {
        ...this.helpConfig,
        example: `.${firstPattern.original}`,
      };
    }

    return null;
  }
}

export declare namespace Command {
  export type ArgumentTypeKeys = ('boolean'|'string'|'number');

  export interface Arguments {
    [key: string]: any;
  }

  export interface ListenerInfo {
    /**
     * The message information from discord.
     */
    message: Message;

    /**
     * The arguments provided in the command.
     */
    args: Arguments;
  }

  export type Listener = (info: ListenerInfo) => void;

  type InputPattern = (string|Pattern);
  export type InputPatterns = (InputPattern|InputPattern[]);

  export interface Config {
    /**
     * The pattern(s) to listen for.
     */
    patterns: InputPatterns;

    /**
     * The listener to invoke when the pattern is matched.
     */
    listener: Listener;
  }

  export interface ConfigInternal extends Config {
    patterns: Pattern[];
  }

  export interface HelpArgument {
    /**
     * The argument type.
     */
    type: ArgumentTypeKeys;

    /**
     * The default value.
     */
    default?: any;

    /**
     * A description of what this argument does.
     */
    description?: string;
  }

  export interface HelpArgumentInternal extends HelpArgument {
    /**
     * The name of the argument.
     */
    name: string;

    /**
     * Whether this argument is positional.
     */
    positional: boolean;
  }

  export interface Help {
    /**
     * The name of the command.
     */
    name: string;

    /**
     * The group the command belongs to.
     *
     * @defaultValue 'General'
     */
    group?: string;

    /**
     * The commands description.
     */
    description: string;

    /**
     * A map describing each of the arguments.
     */
    args?: {
      [key: string]: (string|Partial<HelpArgument>);
    };
  }

  export interface HelpInternal extends Help {
    group: string;

    args: {
      [key: string]: HelpArgumentInternal;
    };

    /**
     * An example of how the command is used.
     */
    example?: string;
  }

  export interface Name {
    /**
     * The name of the parameter.
     */
    name: string;

    /**
     * Whether this parameter should include the remaining positional arguments.
     */
    rest: boolean;
  }

  export interface Pattern {
    /**
     * The list of positional argument names.
     */
    names: Name[];

    /**
     * The pattern's regular expression.
     */
    regex: RegExp;

    /**
     * The original pattern string
     */
    original: string;
  }
}
