import DiscordJS from 'discord.js';
import { chance } from './chance';

export class Reactor {
  #success = ['👍'];
  #failure = ['⛔'];
  #awaiting = ['a:loading:718307876724015105'];

  /**
   * Sets the success reactions.
   *
   * @param  {string[]} reactions - the reactions to add.
   */
  setSuccessReactions(...reactions) {
    this.#success = reactions;
  }

  /**
   * Sets the failure reactions.
   *
   * @param  {string[]} reactions - the reactions to add.
   */
  setFailureReactions(...reactions) {
    this.#failure = reactions;
  }

  /**
   * Sets the awaiting reactions.
   *
   * @param  {string[]} reactions - the reactions to add.
   */
  setAwaitingReactions(...reactions) {
    this.#awaiting = reactions;
  }

  /**
   * Automatically adds emoji to indicate the state of a request.
   *
   * @template T
   * @param {DiscordJS.Message} message - the message to react to.
   * @param {Promise<T>} promise - the promise to wait for.
   * @returns {Promise<T>} - the promise in question.
   */
  async loading(message, promise) {
    let reaction;
    if (promise instanceof Promise) {
      /**
       * @type {DiscordJS.MessageReaction}
       */
      reaction = await this.awaiting(message);
    }

    let response;

    try {
      response = await promise;

      await this.success(message);
    } catch (error) {
      await this.failure(message);

      throw error;
    } finally {
      if (reaction) {
        await Promise.all(
          Array.from(reaction.users.cache.values())
            .filter((user) => user.bot)
            .map(({ id }) => reaction.users.remove(id)),
        );
      }
    }

    return response;
  }


  /**
   * Indicates to the user that the command failed for some reason.
   *
   * @param {DiscordJS.Message} message - the message to react to.
   * @returns {Promise<DiscordJS.MessageReaction>} the reaction
   */
  failure(message) {
    return message.react(chance.pickone(this.#failure));
  }

  /**
   * Indicates to the user that the command was executed successfully.
   *
   * @param {DiscordJS.Message} message - the message to react to.
   * @returns {Promise<DiscordJS.MessageReaction>} the reaction
   */
  success(message) {
    return message.react(chance.pickone(this.#success));
  }

  /**
   * Indicates to the user that the command is in progress.
   *
   * @param {DiscordJS.Message} message - the message to react to.
   * @returns {Promise<DiscordJS.MessageReaction>} the reaction
   */
  awaiting(message) {
    return message.react(chance.pickone(this.#awaiting));
  }
}

export const reactor = new Reactor();
