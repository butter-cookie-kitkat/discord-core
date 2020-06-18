import { ApiBase } from './base';

export class Status extends ApiBase {
  /**
   * Updates the bots status message.
   *
   * @param message - the new status message.
   */
  async set(message: string): Promise<void> {
    if (this._client.user === null) return;

    await this._client.user.setActivity(message, {
      type: 'PLAYING',
    });
  }

  /**
   * Sets the bot to be offline / invisible.
   */
  async offline(): Promise<void> {
    if (this._client.user === null) return;

    await this._client.user.setStatus('invisible');
  }
}
