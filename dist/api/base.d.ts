/// <reference types="node" />
import { Client } from 'discord.js';
import EventEmitter from 'events';
export declare class ApiBase extends EventEmitter {
    /**
     * The Discord.JS client.
     */
    protected _client: Client;
    constructor(client: Client);
}
