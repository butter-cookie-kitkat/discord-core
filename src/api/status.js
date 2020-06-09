import { ApiBase } from './base';

export class Status extends ApiBase {
  async set(message) {
    await this._client.user.setActivity(message, {
      type: 'PLAYING',
    });
  }

  async offline() {
    await this._client.user.setStatus('invisible');
  }
}
