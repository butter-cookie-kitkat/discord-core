import { Message } from 'discord.js';
export declare const TYPES: {
    boolean: BooleanConstructor;
    number: NumberConstructor;
    string: StringConstructor;
};
export declare class Command {
    private config;
    private helpConfig?;
    private yargs?;
    constructor(config: Command.Config);
    /**
     * Checks if the message matches the commands pattern.
     *
     * @param content - the message to test.
     * @returns the matching pattern.
     */
    match(content: string): (null | Command.Pattern);
    private coerce;
    /**
     * Parses the message and extracts the arguments.
     *
     * @param content - the message to parse.
     */
    parse(content: string): {
        [key: string]: any;
    };
    /**
     * Executes the command.
     *
     * @param info - the command information.
     * @returns the promise resolved by the listener.
     */
    exec(info: Command.ListenerInfo): Promise<void>;
    /**
     * @param options - the help options for the given command.
     *
     * @returns the help options.
     */
    help(options?: Command.Help): (null | Command.HelpInternal);
}
export declare namespace Command {
    type ArgumentTypeKeys = ('boolean' | 'string' | 'number');
    interface Arguments {
        [key: string]: any;
    }
    interface ListenerInfo {
        /**
         * The message information from discord.
         */
        message: Message;
        /**
         * The arguments provided in the command.
         */
        args: Arguments;
    }
    type Listener = (info: ListenerInfo) => void;
    type InputPattern = (string | Pattern);
    type InputPatterns = (InputPattern | InputPattern[]);
    interface Config {
        /**
         * The pattern(s) to listen for.
         */
        patterns: InputPatterns;
        /**
         * The listener to invoke when the pattern is matched.
         */
        listener: Listener;
    }
    interface ConfigInternal extends Config {
        patterns: Pattern[];
    }
    interface HelpArgument {
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
    interface HelpArgumentInternal extends HelpArgument {
        /**
         * The name of the argument.
         */
        name: string;
        /**
         * Whether this argument is positional.
         */
        positional: boolean;
    }
    interface Help {
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
            [key: string]: (string | Partial<HelpArgument>);
        };
    }
    interface HelpInternal extends Help {
        group: string;
        args: {
            [key: string]: HelpArgumentInternal;
        };
        /**
         * An example of how the command is used.
         */
        example?: string;
    }
    interface Name {
        /**
         * The name of the parameter.
         */
        name: string;
        /**
         * Whether this parameter should include the remaining positional arguments.
         */
        rest: boolean;
    }
    interface Pattern {
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
