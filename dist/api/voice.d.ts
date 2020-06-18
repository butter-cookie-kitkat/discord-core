import { Collection, GuildMember, Client } from 'discord.js';
import { ApiBase } from './base';
export declare class Voice extends ApiBase {
    private channel;
    private connection;
    constructor(client: Client);
    /**
     * Joins a voice channel with the given id.
     *
     * @param channelID - the id of the voice channel to join.
     */
    join(channelID: string): Promise<void>;
    /**
     * Leaves the voice channel if we're inside of one.
     */
    leave(): Promise<void>;
    /**
     * Plays an Audio File / YouTube Video in the current channel.
     *
     * @param uri - the path of the file or url of the YouTube Video to play.
     * @returns a promise that resolves when the audio starts playing.
     */
    play(uri: string): Promise<void>;
    /**
     * Stops playing the current audio.
     */
    stop(): void;
    /**
     * Pauses the audio if we're playing any.
     */
    pause(): void;
    /**
     * Resumes the audio if we're playing any.
     */
    resume(): void;
    /**
     * Returns the amount of time the given audio has been playing (in ms).
     */
    get elapsed(): (null | number);
    /**
     * Returns the name of the current channel.
     */
    get channelName(): (null | string);
    /**
     * Returns the current members in the given channel.
     */
    get members(): (null | Collection<string, GuildMember>);
    /**
     * Returns true if the bot is actively connected to a voice channel.
     */
    get isConnected(): boolean;
    /**
     * Returns true if the bot is actively playing audio.
     */
    get isPlaying(): boolean;
}
export interface Voice {
    /**
     * Fired when a user joins the channel.
     */
    on(name: 'member:join', listener: () => void): this;
    /**
     * Fired when a user leaves the channel.
     */
    on(name: 'member:leave', listener: () => void): this;
    /**
     * Fired when the bot leaves the channel.
     */
    on(name: 'leave', listener: () => void): this;
    /**
     * Fired when the bot starts playing audio.
     */
    on(name: 'start', listener: (event: Voice.AudioEvent) => void): this;
    /**
     * Fired when the bot finishes playing audio.
     */
    on(name: 'finish', listener: (event: Voice.AudioFinishedEvent) => void): this;
}
export declare namespace Voice {
    interface AudioEvent {
        /**
         * The uri of the audio.
         */
        uri: string;
    }
    interface AudioFinishedEvent extends AudioEvent {
        /**
         * Whether the audio was interrupted.
         */
        interrupted: boolean;
    }
}
