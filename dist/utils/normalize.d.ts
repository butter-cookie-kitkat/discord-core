import { Command } from '../command';
export declare class Normalize {
    /**
     * Normalizes the pattern formats into a common format.
     *
     * @param formats - the formats to normalize.
     * @returns a collection of normalized patterns.
     */
    static patterns(formats: (Normalize.Formats | Normalize.Formats[])): Command.Pattern[];
    /**
     * Normalizes the pattern format into a common pattern.
     *
     * @param format - the format to normalize.
     * @returns a collection of normalized patterns.
     */
    static pattern(format: Normalize.Formats): Command.Pattern;
    static help(options: Command.Help, patterns: Command.Pattern[]): Command.HelpInternal;
}
export declare namespace Normalize {
    type Formats = (string | Command.Pattern);
}
