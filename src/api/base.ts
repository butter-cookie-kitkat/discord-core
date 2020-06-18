// eslint-disable-next-line no-unused-vars
import { Client } from 'discord.js';
import EventEmitter from 'events';

export class ApiBase extends EventEmitter {
  /**
   * The Discord.JS client.
   */
  protected _client: Client;

  constructor(client: Client) {
    super();

    this._client = client;
  }
}
