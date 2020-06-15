import path from 'path';
// eslint-disable-next-line no-unused-vars
import DiscordJS from 'discord.js';
import ytdl from 'ytdl-core-discord';

import { ApiBase } from './base';

import { YOUTUBE } from '../constants/regex';

const TYPES = {
  'webm': 'webm/opus',
  'ogg': 'ogg/opus',
};

export class Voice extends ApiBase {
  /**
   * @type {DiscordJS.VoiceChannel}
   */
  #channel;
  /**
   * @type {DiscordJS.VoiceConnection}
   */
  #connection;

  constructor(client) {
    super(client);

    this._client.on('voiceStateUpdate', (previously, currently) => {
      if (!this.#channel) return;

      if (previously.channelID === this.#channel.id) {
        this.emit('member:leave');
      } else if (currently.channelID) {
        this.emit('member:join');
      }
    });
  }

  /**
   * Joins a voice channel with the given id.
   *
   * @param {string} channelID - the id of the voice channel to join.
   */
  async join(channelID) {
    if (this.#channel && this.#channel.id === channelID) return;

    /**
     * @type {DiscordJS.VoiceChannel}
     */
    const channel = await this._client.channels.fetch(channelID);

    if (channel.type !== 'voice') {
      throw new Error(`Expected the given channel to be a voice channel. (${channel.name})`);
    }

    const connection = await channel.join();

    this.#channel = channel;
    this.#connection = connection;
  }

  async leave() {
    if (this.#connection) {
      if (this.#connection.dispatcher) {
        this.#connection.dispatcher.destroy();
      }

      this.#connection.disconnect();
      this.#connection = null;
    }

    if (this.#channel) {
      this.#channel.leave();
      this.#channel = null;
    }

    this.emit('leave');
  }

  /**
   * Plays an Audio File / YouTube Video in the current channel.
   *
   * @param {string} uri - the path of the file or url of the YouTube Video to play.
   * @returns {Promise<void>} a promise that resolves when the audio starts playing.
   */
  async play(uri) {
    if (!this.isConnected) {
      throw new Error('Must be in a channel to play audio.');
    }

    if (uri.match(YOUTUBE)) {
      this.#connection.play(await ytdl(uri, {
        highWaterMark: 1<<25,
      }), { type: 'opus' });
    } else {
      const TYPE = TYPES[path.extname(uri)] || 'unknown';

      this.#connection.play(uri, {
        volume: false,
        type: TYPE,
      });
    }

    return new Promise((resolve, reject) => {
      this.#connection.dispatcher
        .once('close', () => {
          this.emit('finish', { uri, canceled: this.isPlaying });
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
  stop() {
    if (!this.isConnected) {
      throw new Error('Must be in a channel to stop audio.');
    }

    if (!this.isPlaying) {
      throw new Error('Must be playing audio to stop audio.');
    }

    this.#connection.dispatcher.destroy();
  }

  pause() {
    if (this.isPlaying) {
      this.#connection.dispatcher.pause();
    }
  }

  resume() {
    if (this.isPlaying) {
      this.#connection.dispatcher.resume();
    }
  }

  get elapsed() {
    if (this.isPlaying) {
      return this.#connection.dispatcher.streamTime;
    }

    return null;
  }

  get channel() {
    return this.isConnected ? this.#channel.name : null;
  }

  get members() {
    return this.isConnected ? this.#channel.members : null;
  }

  get isConnected() {
    return Boolean(this.#channel) && Boolean(this.#connection);
  }

  get isPlaying() {
    return this.isConnected && Boolean(this.#connection.dispatcher);
  }
}
