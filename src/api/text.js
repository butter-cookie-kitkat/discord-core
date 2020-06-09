// eslint-disable-next-line no-unused-vars
import DiscordJS from 'discord.js';

import { ApiBase } from './base';

export class Text extends ApiBase {
  /**
   * Sends a message to the text channel with the given id.
   *
   * @param {string} channelID - the id of the text channel to message.
   * @param {(string|DiscordJS.MessageOptions)} message - the message to send to the channel.
   */
  async send(channelID, message) {
    const channel = await this.channel(channelID);

    await channel.send(message);
  }

  /**
   * Finds a text channel with the given id.
   *
   * @param {string} channelID - the id of the text channel to retrieve.
   * @returns {Promise<DiscordJS.TextChannel>} the related text channel.
   */
  async channel(channelID) {
    /**
     * @type {DiscordJS.TextChannel}
     */
    const channel = await this._client.channels.fetch(channelID);

    if (channel.type !== 'text') {
      throw new Error(`Expected the given channel to be a text channel. (${channel.name})`);
    }

    return channel;
  }
}
