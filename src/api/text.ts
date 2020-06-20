import { TextChannel, MessageOptions, MessageEmbed } from 'discord.js';

import { ApiBase } from './base';

export class Text extends ApiBase {
  /**
   * Sends a message to the text channel with the given id.
   *
   * @param channelID - the id of the text channel to message.
   * @param message - the message to send to the channel.
   */
  async send(channelID: string, message: (string|MessageOptions|MessageEmbed)): Promise<void> {
    const channel = await this.channel(channelID);

    await channel.send(message);
  }

  /**
   * Finds a text channel with the given id.
   *
   * @param channelID - the id of the text channel to retrieve.
   * @returns the related text channel.
   */
  async channel(channelID: string): Promise<TextChannel> {
    const channel = await this._client.channels.fetch(channelID) as TextChannel;

    if (channel.type !== 'text') {
      throw new Error(`Expected the given channel to be a text channel. (${channel.name})`);
    }

    return channel;
  }
}
