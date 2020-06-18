import { Message, MessageReaction } from 'discord.js';
export declare class Reactor {
    private reactions;
    /**
     * Sets the success reactions.
     *
     * @param reactions - the reactions to add.
     */
    setSuccessReactions(...reactions: string[]): void;
    /**
     * Sets the failure reactions.
     *
     * @param reactions - the reactions to add.
     */
    setFailureReactions(...reactions: string[]): void;
    /**
     * Sets the awaiting reactions.
     *
     * @param reactions - the reactions to add.
     */
    setAwaitingReactions(...reactions: string[]): void;
    /**
     * Automatically adds emoji to indicate the state of a request.
     *
     * @param message - the message to react to.
     * @param promise - the promise to wait for.
     * @returns the resolved promise.
     */
    loading<T>(message: Message, promise: Promise<T>): Promise<T>;
    /**
     * Indicates to the user that the command failed for some reason.
     *
     * @param message - the message to react to.
     * @returns the reaction
     */
    failure(message: Message): Promise<MessageReaction>;
    /**
     * Indicates to the user that the command was executed successfully.
     *
     * @param message - the message to react to.
     * @returns the reaction
     */
    success(message: Message): Promise<MessageReaction>;
    /**
     * Indicates to the user that the command is in progress.
     *
     * @param message - the message to react to.
     * @returns the reaction
     */
    awaiting(message: Message): Promise<MessageReaction>;
}
export declare const reactor: Reactor;
