import pad from 'pad-left';
import { outdent } from 'outdent';
import EventEmitter from 'events';
import { Client } from 'discord.js';
import path from 'path';
import fs from 'fs';
import ytdl from 'ytdl-core-discord';
import parser from 'yargs-parser';

class Arrays {
  static unique(list) {
    return [...new Set(list)];
  }

}

/**
 * Adds the help command.
 *
 * @param bot - the discord bot.
 */

function help(bot) {
  bot.command(['help', 'help <command>'], function ({
    message,
    args
  }) {
    try {
      return Promise.resolve(function () {
        if (Boolean(args.command)) {
          return Promise.resolve(bot.help(args.command)).then(function (help) {
            let _exit;

            function _temp2(_result2) {
              if (_exit) return _result2;
              // Provide a more detailed help output.
              const maxLength = Math.max(...Object.entries(help.args).map(([name, arg]) => arg.positional ? name.length : name.length + 2));
              return Promise.resolve(message.reply(outdent`
        Here's some information about that command!

        **Usage:**  \`${help.example}\`

        > ${help.description}

        ${help.args ? outdent`
          **Options**

          \`\`\`
          ${Object.entries(help.args).map(([key, arg]) => {
                const name = arg.positional ? key : `--${key}`;
                return outdent`
              ${pad(name, maxLength, ' ')} - ${arg.description}
            `;
              }).join('\r\n')}
          \`\`\`
        ` : ''}
      `)).then(function () {});
            }

            const _temp = function () {
              if (!help) {
                _exit = 1;
                return Promise.resolve(message.reply(outdent`
          Unable to find a command with the given name. (${args.command})
        `));
              }
            }();

            return _temp && _temp.then ? _temp.then(_temp2) : _temp2(_temp);
          });
        } else {
          return Promise.resolve(bot.help()).then(function (help) {
            const groups = {};
            const names = Arrays.unique(help.map(h => {
              groups[h.group] = groups[h.group] || [];
              groups[h.group].push(h);
              return h.group;
            }));
            return Promise.resolve(message.reply(outdent`
        Here's a list of the available commands!

        ${names.map(name => outdent`
          **${name}**

            ${groups[name].map(help => outdent`
              \`${help.example}\` - ${help.description}
            `).join('\r\n  ')}
        `).join('\r\n\r\n')}
      `));
          });
        }
      }());
    } catch (e) {
      return Promise.reject(e);
    }
  }).help({
    name: 'help',
    description: 'Display a list of the available commands.',
    args: {
      command: 'The name of the command to display help information for.'
    }
  });
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

class ApiBase extends EventEmitter {
  constructor(client) {
    super();
    this._client = client;
  }

}

class Escape {
  /**
   * Escapes any regular expression values from a given string.
   *
   * @param value - the regular expression string to escape.
   * @returns the escaped regular expression
   */
  static regex(value) {
    return value.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  }

}

function URL(domain) {
  return new RegExp(`^(?:https?://)?(?:www\\.)?${Escape.regex(domain)}`, 'i');
}
const YOUTUBE = URL('youtube.com');

const TYPES = {
  'webm': 'webm/opus',
  'ogg': 'ogg/opus'
};
class Voice extends ApiBase {
  constructor(client) {
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


  join(channelID) {
    try {
      const _this = this;

      if (_this.channel && _this.channel.id === channelID) return Promise.resolve();
      return Promise.resolve(_this._client.channels.fetch(channelID)).then(function (channel) {
        if (channel.type !== 'voice') {
          throw new Error(`Expected the given channel to be a voice channel. (${channel.name})`);
        }

        return Promise.resolve(channel.join()).then(function (connection) {
          _this.channel = channel;
          _this.connection = connection;
        });
      });
    } catch (e) {
      return Promise.reject(e);
    }
  }
  /**
   * Leaves the voice channel if we're inside of one.
   */


  leave() {
    try {
      const _this2 = this;

      if (_this2.connection) {
        if (_this2.connection.dispatcher) {
          _this2.connection.dispatcher.destroy();
        }

        _this2.connection.disconnect();

        _this2.connection = null;
      }

      if (_this2.channel) {
        _this2.channel.leave();

        _this2.channel = null;
      }

      _this2.emit('leave');

      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  }
  /**
   * Plays an Audio File / YouTube Video in the current channel.
   *
   * @param uri - the path of the file or url of the YouTube Video to play.
   * @returns a promise that resolves when the audio starts playing.
   */


  play(uri) {
    try {
      const _this3 = this;

      function _temp2() {
        return new Promise((resolve, reject) => {
          connection.dispatcher.once('close', () => {
            _this3.emit('finish', {
              uri,
              interrupted: _this3.isPlaying
            });
          }).once('error', error => reject(error)).once('start', () => {
            _this3.emit('start', {
              uri
            });

            resolve();
          });
        });
      }

      if (!_this3.isConnected) {
        throw new Error('Must be in a channel to play audio.');
      }

      const connection = _this3.connection;

      const _temp = function () {
        if (uri.match(YOUTUBE)) {
          const _play = connection.play;
          return Promise.resolve(ytdl(uri, {
            highWaterMark: 1 << 25
          })).then(function (_ytdl) {
            _play.call(connection, _ytdl, {
              type: 'opus'
            });
          });
        } else {
          const extension = path.extname(uri).replace(/^\./, '');

          if (extension === 'webm' || extension === 'ogg') {
            const TYPE = TYPES[extension];
            connection.play(fs.createReadStream(uri), {
              volume: false,
              type: TYPE
            });
          } else {
            connection.play(uri, {
              volume: false
            });
          }
        }
      }();

      return Promise.resolve(_temp && _temp.then ? _temp.then(_temp2) : _temp2(_temp));
    } catch (e) {
      return Promise.reject(e);
    }
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

    const connection = this.connection;
    connection.dispatcher.destroy();
  }
  /**
   * Pauses the audio if we're playing any.
   */


  pause() {
    if (this.isPlaying) {
      const connection = this.connection;
      connection.dispatcher.pause();
    }
  }
  /**
   * Resumes the audio if we're playing any.
   */


  resume() {
    if (this.isPlaying) {
      const connection = this.connection;
      connection.dispatcher.resume();
    }
  }
  /**
   * Returns the amount of time the given audio has been playing (in ms).
   */


  get elapsed() {
    if (this.isPlaying) {
      const connection = this.connection;
      return connection.dispatcher.streamTime;
    }

    return null;
  }
  /**
   * Returns the name of the current channel.
   */


  get channelName() {
    if (this.isConnected) {
      const channel = this.channel;
      return channel.name;
    }

    return null;
  }
  /**
   * Returns the current members in the given channel.
   */


  get members() {
    if (this.isConnected) {
      const channel = this.channel;
      return channel.members;
    }

    return null;
  }
  /**
   * Returns true if the bot is actively connected to a voice channel.
   */


  get isConnected() {
    return this.channel !== null && this.connection !== null;
  }
  /**
   * Returns true if the bot is actively playing audio.
   */


  get isPlaying() {
    if (this.isConnected) {
      const connection = this.connection;
      return Boolean(connection.dispatcher);
    }

    return false;
  }

}

class Text extends ApiBase {
  /**
   * Sends a message to the text channel with the given id.
   *
   * @param channelID - the id of the text channel to message.
   * @param message - the message to send to the channel.
   */
  send(channelID, message) {
    try {
      const _this = this;

      return Promise.resolve(_this.channel(channelID)).then(function (channel) {
        return Promise.resolve(channel.send(message)).then(function () {});
      });
    } catch (e) {
      return Promise.reject(e);
    }
  }
  /**
   * Finds a text channel with the given id.
   *
   * @param channelID - the id of the text channel to retrieve.
   * @returns the related text channel.
   */


  channel(channelID) {
    try {
      const _this2 = this;

      return Promise.resolve(_this2._client.channels.fetch(channelID)).then(function (channel) {
        if (channel.type !== 'text') {
          throw new Error(`Expected the given channel to be a text channel. (${channel.name})`);
        }

        return channel;
      });
    } catch (e) {
      return Promise.reject(e);
    }
  }

}

class Status extends ApiBase {
  /**
   * Updates the bots status message.
   *
   * @param message - the new status message.
   */
  set(message) {
    try {
      const _this = this;

      if (_this._client.user === null) return Promise.resolve();
      return Promise.resolve(_this._client.user.setActivity(message, {
        type: 'PLAYING'
      })).then(function () {});
    } catch (e) {
      return Promise.reject(e);
    }
  }
  /**
   * Sets the bot to be offline / invisible.
   */


  offline() {
    try {
      const _this2 = this;

      if (_this2._client.user === null) return Promise.resolve();
      return Promise.resolve(_this2._client.user.setStatus('invisible')).then(function () {});
    } catch (e) {
      return Promise.reject(e);
    }
  }

}

class Normalize {
  /**
   * Normalizes the pattern formats into a common format.
   *
   * @param formats - the formats to normalize.
   * @returns a collection of normalized patterns.
   */
  static patterns(formats) {
    if (Array.isArray(formats)) {
      return formats.map(format => Normalize.pattern(format));
    }

    return [Normalize.pattern(formats)];
  }
  /**
   * Normalizes the pattern format into a common pattern.
   *
   * @param format - the format to normalize.
   * @returns a collection of normalized patterns.
   */


  static pattern(format) {
    if (typeof format === 'string') {
      const names = [];
      const regex = new RegExp(`^${format.replace(/<([^<>]+)>/g, (_, name) => {
        const rest = name.startsWith('...');
        names.push({
          name: rest ? name.replace(/^[.]{3}/, '') : name,
          rest
        });
        return rest ? '(.+)' : '([^\\s]+)';
      })}`, 'i');
      return {
        names,
        regex,
        original: format
      };
    }

    return format;
  }

  static help(options, patterns) {
    return {
      name: options.name,
      description: options.description,
      group: options.group || 'General',
      args: Object.entries(options.args || {}).reduce((output, [key, value]) => _extends({}, output, {
        [key]: _extends({
          name: key
        }, typeof value === 'object' ? {
          description: value.description,
          type: value.type || 'string'
        } : {
          description: value,
          type: 'string'
        }, {
          positional: Boolean(patterns.find(pattern => pattern.names.some(({
            name
          }) => key === name)))
        })
      }), {})
    };
  }

}

const TYPES$1 = {
  boolean: Boolean,
  number: Number,
  string: String
};
class Command {
  constructor(config) {
    this.config = _extends({}, config, {
      patterns: Normalize.patterns(config.patterns)
    });
  }
  /**
   * Checks if the message matches the commands pattern.
   *
   * @param content - the message to test.
   * @returns the matching pattern.
   */


  match(content) {
    return this.config.patterns.filter(({
      regex
    }) => content.match(regex)).reduce((closestPattern, pattern) => {
      if (!closestPattern || pattern.regex.toString().length > closestPattern.regex.toString().length) {
        return pattern;
      }

      return closestPattern;
    }, null);
  }

  coerce(type, value) {
    const Type = TYPES$1[type];

    if (!Type) {
      throw new Error(`Unable to coerce the given type. (${type})`);
    }

    return value ? Type(value) : value;
  }
  /**
   * Parses the message and extracts the arguments.
   *
   * @param content - the message to parse.
   */


  parse(content) {
    const pattern = this.match(content);

    if (!pattern) {
      throw new Error(`Given message isn't intended for this command. (${content})`);
    }

    const args = parser(content, _extends({}, this.yargs, {
      configuration: {
        'unknown-options-as-args': true
      }
    }));

    const unknowns = args._.filter(arg => arg.startsWith('-'));

    if (unknowns.length > 0) {
      throw new Error(`Unknown arguments. ('${unknowns.join(`','`)}')`);
    }

    const [, ...groups] = args._;

    if (this.helpConfig) {
      return Object.entries(this.helpConfig.args).reduce((output, [name, arg]) => {
        const positionalIndex = pattern.names.findIndex(({
          name: patternName
        }) => name === patternName);
        let value;

        if (positionalIndex === -1) {
          value = args[name];
        } else if (pattern.names[positionalIndex].rest) {
          value = groups.slice(positionalIndex).join(' ');
        } else {
          value = groups[positionalIndex];
        }

        output[name] = this.coerce(arg.type, value || arg.default || null);
        return output;
      }, {});
    }

    return {};
  }
  /**
   * Executes the command.
   *
   * @param info - the command information.
   * @returns the promise resolved by the listener.
   */


  exec(info) {
    try {
      const _this = this;

      return Promise.resolve(_this.config.listener(info)).then(function () {});
    } catch (e) {
      return Promise.reject(e);
    }
  }
  /**
   * @param options - the help options for the given command.
   *
   * @returns the help options.
   */


  help(options) {
    if (options !== undefined) {
      this.helpConfig = Normalize.help(options, this.config.patterns);
      this.yargs = Object.entries(this.helpConfig.args).reduce((output, [name, arg]) => {
        if (!arg.positional) {
          output[arg.type].push(name);

          if (arg.default) {
            output.default[name] = arg.default;
          }
        }

        return output;
      }, {
        array: [],
        boolean: [],
        number: [],
        string: [],
        default: {}
      });
    }

    const [firstPattern] = this.config.patterns;

    if (this.helpConfig) {
      return _extends({}, this.helpConfig, {
        example: `.${firstPattern.original}`
      });
    }

    return null;
  }

}

class Random {
  /**
   * Generates a random number between the max and min.
   *
   * @param min - the minimum possible number.
   * @param max - the maximum possible number.
   * @returns a random number.
   */
  integer(min, max) {
    return Math.round(Math.random() * (max - min) + min);
  }
  /**
   * Randomly picks an item from the list.
   *
   * @param list - the list to pick an item from.
   * @returns a random item from the list.
   */


  pickone(list) {
    return list[this.integer(0, list.length - 1)];
  }

}

const random = new Random();

function _catch(body, recover) {
  try {
    var result = body();
  } catch (e) {
    return recover(e);
  }

  if (result && result.then) {
    return result.then(void 0, recover);
  }

  return result;
}

function _finallyRethrows(body, finalizer) {
  try {
    var result = body();
  } catch (e) {
    return finalizer(true, e);
  }

  if (result && result.then) {
    return result.then(finalizer.bind(null, false), finalizer.bind(null, true));
  }

  return finalizer(false, result);
}

class Reactor {
  constructor() {
    this.reactions = {
      success: ['👍'],
      failure: ['⛔'],
      awaiting: ['a:loading:718307876724015105']
    };
  }
  /**
   * Sets the success reactions.
   *
   * @param reactions - the reactions to add.
   */


  setSuccessReactions(...reactions) {
    this.reactions.success = reactions;
  }
  /**
   * Sets the failure reactions.
   *
   * @param reactions - the reactions to add.
   */


  setFailureReactions(...reactions) {
    this.reactions.failure = reactions;
  }
  /**
   * Sets the awaiting reactions.
   *
   * @param reactions - the reactions to add.
   */


  setAwaitingReactions(...reactions) {
    this.reactions.awaiting = reactions;
  }
  /**
   * Automatically adds emoji to indicate the state of a request.
   *
   * @param message - the message to react to.
   * @param promise - the promise to wait for.
   * @returns the resolved promise.
   */


  loading(message, promise) {
    try {
      const _this = this;

      const reactionPromise = _this.awaiting(message);

      return Promise.resolve(_finallyRethrows(function () {
        return _catch(function () {
          return Promise.resolve(Promise.all([promise, reactionPromise])).then(function ([response]) {
            return Promise.resolve(_this.success(message)).then(function () {
              return response;
            });
          });
        }, function (error) {
          return Promise.resolve(_this.failure(message)).then(function () {
            throw error;
          });
        });
      }, function (_wasThrown, _result) {
        return Promise.resolve(reactionPromise).then(function (reaction) {
          return Promise.resolve(Promise.all(Array.from(reaction.users.cache.values()).filter(user => user.bot).map(({
            id
          }) => reaction.users.remove(id)))).then(function () {
            if (_wasThrown) throw _result;
            return _result;
          });
        });
      }));
    } catch (e) {
      return Promise.reject(e);
    }
  }
  /**
   * Indicates to the user that the command failed for some reason.
   *
   * @param message - the message to react to.
   * @returns the reaction
   */


  failure(message) {
    return message.react(random.pickone(this.reactions.failure));
  }
  /**
   * Indicates to the user that the command was executed successfully.
   *
   * @param message - the message to react to.
   * @returns the reaction
   */


  success(message) {
    return message.react(random.pickone(this.reactions.success));
  }
  /**
   * Indicates to the user that the command is in progress.
   *
   * @param message - the message to react to.
   * @returns the reaction
   */


  awaiting(message) {
    return message.react(random.pickone(this.reactions.awaiting));
  }

}
const reactor = new Reactor();

function _catch$1(body, recover) {
  try {
    var result = body();
  } catch (e) {
    return recover(e);
  }

  if (result && result.then) {
    return result.then(void 0, recover);
  }

  return result;
}

class DiscordBot extends EventEmitter {
  constructor(config) {
    super();
    this.commands = [];
    this.onMessage = this.onMessage.bind(this);
    this.config = _extends({
      prefix: '.'
    }, config);
    this.client = new Client();
    this.client.on('message', this.onMessage);
    this.voice = new Voice(this.client);
    this.text = new Text(this.client);
    this.status = new Status(this.client);
  }
  /**
   * The ID of the bot user.
   */


  get id() {
    return this.client.user && this.client.user.id;
  }
  /**
   * The name of the bot user.
   */


  get name() {
    return this.client.user && this.client.user.username;
  }
  /**
   * The avatar of the bot user.
   */


  get avatar() {
    return this.client.user && this.client.user.avatarURL();
  }

  login() {
    return this.client.login(this.config.token);
  }
  /**
   * Adds a command to the bot.
   *
   * @param patterns - the pattern to listen for.
   * @param listener - the listener to invoke when the pattern is matched.
   * @returns the new command.
   */


  command(patterns, listener) {
    const command = new Command({
      patterns,
      listener
    });
    this.commands.push(command);
    return command;
  }

  onMessage(message) {
    try {
      const _this = this;

      let args;
      return Promise.resolve(_catch$1(function () {
        let {
          content
        } = message;
        if (!content.startsWith(_this.config.prefix)) return;
        content = content.replace(new RegExp(`^${_this.config.prefix}`), '');

        const command = _this.commands.find(command => command.match(content));

        if (!command) return; // TODO: This should be multi-threaded.

        args = command.parse(content);
        const info = {
          message,
          args
        };

        _this.emit('command:before', info);

        return Promise.resolve(reactor.loading(info.message, command.exec(info))).then(function () {
          _this.emit('command:after', info);
        });
      }, function (error) {
        if (_this.listenerCount('error') > 0) {
          _this.emit('error', {
            message,
            args,
            error
          });
        } else {
          console.error(error);
          throw error;
        }
      }));
    } catch (e) {
      return Promise.reject(e);
    }
  }

  help(name) {
    if (name) {
      const command = this.commands.find(command => {
        const help = command.help();
        return help && help.name === name;
      });
      return command ? command.help() : null;
    }

    return this.commands.map(command => command.help()).filter(Boolean);
  }

}

const CommonCommands = {
  help
};

export { CommonCommands, DiscordBot, reactor };
//# sourceMappingURL=bot.module.js.map
