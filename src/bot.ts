import EventEmitter from 'events';
import { Client, Message } from 'discord.js';

import { Voice } from './api/voice';
import { Text } from './api/text';
import { Status } from './api/status';
import { Command } from './command';
import { reactor } from './utils/reactor';

export class DiscordBot extends EventEmitter {
  private config: DiscordBot.ConfigInternal;
  private client: Client;
  private commands: Command[] = [];
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

  constructor(config: DiscordBot.Config) {
    super();

    this.onMessage = this.onMessage.bind(this);

    this.config = {
      prefix: '.',
      ...config,
    };


    this.client = new Client();
    this.client.on('message', this.onMessage);

    this.voice = new Voice(this.client);
    this.text = new Text(this.client);
    this.status = new Status(this.client);
  }

  /**
   * The ID of the bot user.
   */
  get id(): (string|null) {
    return this.client.user && this.client.user.id;
  }

  /**
   * The name of the bot user.
   */
  get name(): (string|null) {
    return this.client.user && this.client.user.username;
  }

  /**
   * The avatar of the bot user.
   */
  get avatar(): (string|null) {
    return this.client.user && this.client.user.avatarURL();
  }

  login(): Promise<string> {
    return this.client.login(this.config.token);
  }

  /**
   * Adds a command to the bot.
   *
   * @param patterns - the pattern to listen for.
   * @param listener - the listener to invoke when the pattern is matched.
   * @returns the new command.
   */
  command(patterns: Command.InputPatterns, listener: Command.Listener): Command {
    const command = new Command({
      patterns,
      listener,
    });

    this.commands.push(command);

    return command;
  }

  private async onMessage(message: Message): Promise<void> {
    let args;

    try {
      let { content } = message;

      if (!content.startsWith(this.config.prefix)) return;

      content = content.replace(new RegExp(`^${this.config.prefix}`), '');

      const command = this.commands.find((command) => command.match(content));

      if (!command) return;

      // TODO: This should be multi-threaded.
      args = command.parse(content);

      const info = {
        message,
        args,
      };

      this.emit('command:before', info);
      await reactor.loading(info.message, command.exec(info));
      this.emit('command:after', info);
    } catch (error) {
      if (this.listenerCount('error') > 0) {
        this.emit('error', {
          message,
          args,
          error,
        });
      } else {
        console.error(error);
        throw error;
      }
    }
  }

  /**
   * Returns the help information for a given command or all commands.
   *
   * @param name - the name of the command to retrieve help information for.
   * @returns the help information.
   */
  help(): Command.HelpInternal[];
  help(name: string): (null|Command.HelpInternal);
  help(name?: string): (null|Command.HelpInternal|Command.HelpInternal[]) {
    if (name) {
      const command = this.commands.find((command) => {
        const help = command.help();

        return help && help.name === name;
      });

      return command ? command.help() : null;
    }

    return this.commands.map((command) => command.help()).filter(Boolean) as Command.HelpInternal[];
  }
}

export interface DiscordBot {
  on(name: 'command:before', listener: DiscordBot.CommandEventListener): this;
  on(name: 'command:after', listener: DiscordBot.CommandEventListener): this;
  on(name: 'error', listener: DiscordBot.EventErrorListener): this;
}

export declare namespace DiscordBot {
  export interface CommandEvent {
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

  export interface CommandErrorEvent extends CommandEvent {
    /**
     * The error.
     */
    error: any;
  }


  export type CommandEventListener = (event: CommandEvent) => void;
  export type EventErrorListener = (event: CommandErrorEvent) => void;

  export interface Config {
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

  export interface ConfigInternal extends Config {
    prefix: string;
  }
}
