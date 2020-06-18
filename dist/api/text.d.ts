import { TextChannel, MessageOptions } from 'discord.js';
import { ApiBase } from './base';
export declare class Text extends ApiBase {
    /**
     * Sends a message to the text channel with the given id.
     *
     * @param channelID - the id of the text channel to message.
     * @param message - the message to send to the channel.
     */
    send(channelID: string, message: (string | MessageOptions)): Promise<void>;
    /**
     * Finds a text channel with the given id.
     *
     * @param channelID - the id of the text channel to retrieve.
     * @returns the related text channel.
     */
    channel(channelID: string): Promise<TextChannel>;
}
