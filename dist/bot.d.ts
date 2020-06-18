/// <reference types="node" />
import EventEmitter from 'events';
import { Message } from 'discord.js';
import { Voice } from './api/voice';
import { Text } from './api/text';
import { Status } from './api/status';
import { Command } from './command';
export declare class DiscordBot extends EventEmitter {
    private config;
    private client;
    private commands;
    /**
     * Methods to interact with voice channels.
     */
    voice: Voice;
    /**
     * Methods to interact with text channels.
     */
    text: Text;
    /**
     * Methods to interact with the bots status.
     */
    status: Status;
    constructor(config: DiscordBot.Config);
    /**
     * The ID of the bot user.
     */
    get id(): (string | null);
    /**
     * The name of the bot user.
     */
    get name(): (string | null);
    /**
     * The avatar of the bot user.
     */
    get avatar(): (string | null);
    login(): Promise<string>;
    /**
     * Adds a command to the bot.
     *
     * @param patterns - the pattern to listen for.
     * @param listener - the listener to invoke when the pattern is matched.
     * @returns the new command.
     */
    command(patterns: Command.InputPatterns, listener: Command.Listener): Command;
    private onMessage;
    /**
     * Returns the help information for a given command or all commands.
     *
     * @param name - the name of the command to retrieve help information for.
     * @returns the help information.
     */
    help(): Command.HelpInternal[];
    help(name: string): (null | Command.HelpInternal);
}
export interface DiscordBot {
    on(name: 'command:before', listener: DiscordBot.CommandEventListener): this;
    on(name: 'command:after', listener: DiscordBot.CommandEventListener): this;
    on(name: 'error', listener: DiscordBot.EventErrorListener): this;
}
export declare namespace DiscordBot {
    interface CommandEvent {
        /**
         * The Discord.JS Message.
         */
        message: Message;
        /**
         * The arguments passed.
         */
        args: {
            [key: string]: any;
        };
    }
    interface CommandErrorEvent extends CommandEvent {
        /**
         * The error.
         */
        error: any;
    }
    type CommandEventListener = (event: CommandEvent) => void;
    type EventErrorListener = (event: CommandErrorEvent) => void;
    interface Config {
        /**
         * The command prefix.
         *
         * @defaultValue '.'
         */
        prefix?: string;
        /**
         * The Discord Auth token.
         */
        token: string;
    }
    interface ConfigInternal extends Config {
        prefix: string;
    }
}
