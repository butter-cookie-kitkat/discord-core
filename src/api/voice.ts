import path from 'path';
import fs from 'fs';
import { VoiceChannel, VoiceConnection, Collection, GuildMember, Client } from 'discord.js';
import ytdl from 'ytdl-core-discord';

import { ApiBase } from './base';

import { YOUTUBE } from '../constants/regex';

const TYPES: {
  ogg: 'ogg/opus';
  webm: 'webm/opus';
} = {
  'webm': 'webm/opus',
  'ogg': 'ogg/opus',
};

export class Voice extends ApiBase {
  private channel: (null|VoiceChannel);
  private connection: (null|VoiceConnection);

  constructor(client: Client) {
    super(client);

    this.channel = null;
    this.connection = null;

    this._client.on('voiceStateUpdate', (previously, currently) => {
      if (!this.channel) return;

      if (previously.channelID === this.channel.id) {
        this.emit('member:leave');
      } else if (currently.channelID) {
        this.emit('member:join');
      }
    });
  }

  /**
   * Joins a voice channel with the given id.
   *
   * @param channelID - the id of the voice channel to join.
   */
  async join(channelID: string): Promise<void> {
    if (this.channel && this.channel.id === channelID) return;

    const channel = await this._client.channels.fetch(channelID) as VoiceChannel;

    if (channel.type !== 'voice') {
      throw new Error(`Expected the given channel to be a voice channel. (${channel.name})`);
    }

    const connection = await channel.join();

    this.channel = channel;
    this.connection = connection;
  }

  /**
   * Leaves the voice channel if we're inside of one.
   */
  async leave(): Promise<void> {
    if (this.connection) {
      if (this.connection.dispatcher) {
        this.connection.dispatcher.destroy();
      }

      this.connection.disconnect();
      this.connection = null;
    }

    if (this.channel) {
      this.channel.leave();
      this.channel = null;
    }

    this.emit('leave');
  }

  /**
   * Plays an Audio File / YouTube Video in the current channel.
   *
   * @param uri - the path of the file or url of the YouTube Video to play.
   * @returns a promise that resolves when the audio starts playing.
   */
  async play(uri: string): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Must be in a channel to play audio.');
    }

    const connection = this.connection as VoiceConnection;

    if (uri.match(YOUTUBE)) {
      connection.play(await ytdl(uri, {
        highWaterMark: 1<<25,
      }), { type: 'opus' });
    } else {
      const extension = path.extname(uri).replace(/^\./, '');

      if (extension === 'webm' || extension === 'ogg') {
        const TYPE = TYPES[extension];

        connection.play(fs.createReadStream(uri), {
          volume: false,
          type: TYPE,
        });
      } else {
        connection.play(uri, {
          volume: false,
        });
      }
    }

    return new Promise((resolve, reject) => {
      connection.dispatcher
        .once('close', () => {
          this.emit('finish', { uri, interrupted: this.isPlaying });
        })
        .once('error', (error) => reject(error))
        .once('start', () => {
          this.emit('start', { uri });
          resolve();
        });
    });
  }

  /**
   * Stops playing the current audio.
   */
  stop(): void {
    if (!this.isConnected) {
      throw new Error('Must be in a channel to stop audio.');
    }

    if (!this.isPlaying) {
      throw new Error('Must be playing audio to stop audio.');
    }

    const connection = this.connection as VoiceConnection;

    connection.dispatcher.destroy();
  }

  /**
   * Pauses the audio if we're playing any.
   */
  pause(): void {
    if (this.isPlaying) {
      const connection = this.connection as VoiceConnection;

      connection.dispatcher.pause();
    }
  }

  /**
   * Resumes the audio if we're playing any.
   */
  resume(): void {
    if (this.isPlaying) {
      const connection = this.connection as VoiceConnection;

      connection.dispatcher.resume();
    }
  }

  /**
   * Returns the amount of time the given audio has been playing (in ms).
   */
  get elapsed(): (null|number) {
    if (this.isPlaying) {
      const connection = this.connection as VoiceConnection;

      return connection.dispatcher.streamTime;
    }

    return null;
  }

  /**
   * Returns the name of the current channel.
   */
  get channelName(): (null|string) {
    if (this.isConnected) {
      const channel = this.channel as VoiceChannel;

      return channel.name;
    }

    return null;
  }

  /**
   * Returns the current members in the given channel.
   */
  get members(): (null|Collection<string, GuildMember>) {
    if (this.isConnected) {
      const channel = this.channel as VoiceChannel;

      return channel.members;
    }

    return null;
  }

  /**
   * Returns true if the bot is actively connected to a voice channel.
   */
  get isConnected(): boolean {
    return this.channel !== null && this.connection !== null;
  }

  /**
   * Returns true if the bot is actively playing audio.
   */
  get isPlaying(): boolean {
    if (this.isConnected) {
      const connection = this.connection as VoiceConnection;

      return Boolean(connection.dispatcher);
    }

    return false;
  }
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
  export interface AudioEvent {
    /**
     * The uri of the audio.
     */
    uri: string;
  }

  export interface AudioFinishedEvent extends AudioEvent {
    /**
     * Whether the audio was interrupted.
     */
    interrupted: boolean;
  }
}
