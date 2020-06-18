import { Command } from '../command';

export class Normalize {
  /**
   * Normalizes the pattern formats into a common format.
   *
   * @param formats - the formats to normalize.
   * @returns a collection of normalized patterns.
   */
  static patterns(formats: (Normalize.Formats|Normalize.Formats[])): Command.Pattern[] {
    if (Array.isArray(formats)) {
      return formats.map((format) => Normalize.pattern(format));
    }

    return [Normalize.pattern(formats)];
  }

  /**
   * Normalizes the pattern format into a common pattern.
   *
   * @param format - the format to normalize.
   * @returns a collection of normalized patterns.
   */
  static pattern(format: Normalize.Formats): Command.Pattern {
    if (typeof(format) === 'string') {
      const names: Command.Name[] = [];

      const regex = new RegExp(`^${format.replace(/<([^<>]+)>/g, (_, name) => {
        const rest = name.startsWith('...');
        names.push({
          name: rest ? name.replace(/^[.]{3}/, '') : name,
          rest,
        });

        return rest ? '(.+)' : '([^\\s]+)';
      })}`, 'i');

      return {
        names,
        regex,
        original: format,
      };
    }

    return format;
  }

  static help(options: Command.Help, patterns: Command.Pattern[]): Command.HelpInternal {
    return {
      name: options.name,
      description: options.description,
      group: options.group || 'General',
      args: Object.entries(options.args || {}).reduce((output, [key, value]) => ({
        ...output,
        [key]: {
          name: key,
          ...(typeof(value) === 'object' ? {
            description: value.description,
            type: value.type || 'string',
          } : {
            description: value,
            type: 'string',
          }),
          positional: Boolean(patterns.find((pattern) => pattern.names.some(({ name }) => key === name))),
        },
      }), {} as {
        [key: string]: Command.HelpArgumentInternal;
      }),
    };
  }
}

export declare namespace Normalize {
  export type Formats = (string|Command.Pattern);
}
