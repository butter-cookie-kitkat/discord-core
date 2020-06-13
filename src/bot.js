import EventEmitter from 'events';
import DiscordJS from 'discord.js';

import { Voice } from './api/voice';
import { Text } from './api/text';
import { Status } from './api/status';
import { Command } from './command';
import { reactor } from './utils/reactor';

/**
 * @typedef DiscordBot.Config
 * @property {string} [prefix="."] - the command prefix. (defaults to '.')
 * @property {string} token - the discord auth token.
 */

export class DiscordBot extends EventEmitter {
  /**
   * @type {DiscordBot.Config}
   */
  #config;
  /**
   * @type {DiscordJS.Client} - the Discord.JS client.
   */
  #client;
  /**
   * @type {Command[]} - the list of commands.
   */
  #commands = [];

  /**
   * @param {DiscordBot.Config} config - the configuration for the bot.
   */
  constructor(config) {
    super();

    this.#config = {
      prefix: '.',
      ...config,
    };

    this.#client = new DiscordJS.Client();
    this.#client.on('message', this.#onMessage);

    this.voice = new Voice(this.#client);
    this.text = new Text(this.#client);
    this.status = new Status(this.#client);
  }

  get id() {
    return this.#client.user.id;
  }

  get name() {
    return this.#client.user.username;
  }

  get avatar() {
    return this.#client.user.avatarURL;
  }

  login() {
    return this.#client.login(this.#config.token);
  }

  /**
   * Adds a command to the bot.
   *
   * @param {string|RegExp|string[]|RegExp[]} patterns - the pattern to listen for.
   * @param {import('./command').Listener} listener - the listener to invoke when the pattern is matched.
   * @returns {Command} the new command.
   */
  command(patterns, listener) {
    const command = new Command({
      patterns,
      listener,
    });

    this.#commands.push(command);

    return command;
  }

  /**
   * @param {DiscordJS.Message} message - the discord.js message.
   */
  #onMessage = async (message) => {
    let args;

    try {
      let { content } = message;

      if (!content.startsWith(this.#config.prefix)) return;

      content = content.replace(new RegExp(`^${this.#config.prefix}`), '');

      const command = this.#commands.find((command) => command.match(content));

      if (!command) return;

      // TODO: This should be multi-threaded.
      args = command.parse(content);

      const info = {
        message,
        args: command.parse(content),
      };

      this.emit('command:before', info);
      await reactor.loading(command.exec(info));
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

  help(name) {
    if (name) {
      const command = this.#commands.find((command) => command.help().name === name);

      return command ? command.help() : null;
    }

    return this.#commands.map((command) => command.help());
  }
}
