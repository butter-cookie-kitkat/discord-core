import pad from 'pad-left';
import { outdent } from 'outdent';

import { Arrays } from '../utils/arrays';

/**
 * Adds the help command.
 *
 * @param {import('../index').DiscordBot} bot - the discord bot.
 */
export function help(bot) {
  bot.command([
    'help',
    'help <command>',
  ], async ({ message, args }) => {
    const help = await bot.help(args.command);

    if (!help) {
      return await message.reply(outdent`
        Unable to find a command with the given name. (${args.command})
      `);
    }

    if (Array.isArray(help)) {
      /**
       * @type {Object<string, import('../command').NormalizedHelpOptions[]>} the help groups.
       */
      const groups = {};

      const names = Arrays.unique(help.map((h) => {
        const group = h.group || 'General';

        groups[group] = groups[group] || [];
        groups[group].push(h);

        return group;
      }));

      return await message.reply(outdent`
        Here's a list of the available commands!

        ${names.map((name) => outdent`
          **${name}**

            ${groups[name].map((help) => outdent`
              \`${help.example}\` - ${help.description}
            `).join('\r\n  ')}
        `).join('\r\n\r\n')}
      `);
    }

    // Provide a more detailed help output.
    const maxLength = Math.max(...Object.entries(help.args).map(([name, arg]) => arg.positional ? name.length : name.length + 2));

    await message.reply(outdent`
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
    `);
  }).help({
    name: 'help',
    description: 'Display a list of the available commands.',
    args: {
      command: 'The name of the command to display help information for.',
    },
  })
}
