import { ApiBase } from './base';
export declare class Status extends ApiBase {
    /**
     * Updates the bots status message.
     *
     * @param message - the new status message.
     */
    set(message: string): Promise<void>;
    /**
     * Sets the bot to be offline / invisible.
     */
    offline(): Promise<void>;
}
