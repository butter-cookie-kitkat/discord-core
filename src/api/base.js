// eslint-disable-next-line no-unused-vars
import DiscordJS from 'discord.js';
import EventEmitter from 'events';

export class ApiBase extends EventEmitter {
  /**
   * @type {DiscordJS.Client} the Discord.JS client.
   *
   * @protected
   */
  _client;

  constructor(client) {
    super();

    this._client = client;
  }
}
