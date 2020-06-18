import pad from 'pad-left';
import { outdent } from 'outdent';

import { DiscordBot } from '../bot';
import { Arrays } from '../utils/arrays';
import { Command } from '../command';

/**
 * Adds the help command.
 *
 * @param bot - the discord bot.
 */
export function help(bot: DiscordBot): void {
  bot.command([
    'help',
    'help <command>',
  ], async ({ message, args }) => {
    if (Boolean(args.command)) {
      const help = await bot.help(args.command as string);

      if (!help) {
        return await message.reply(outdent`
          Unable to find a command with the given name. (${args.command})
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
    } else {
      const help = await bot.help();

      const groups: {
        [key: string]: Command.HelpInternal[];
      } = {};

      const names = Arrays.unique(help.map((h) => {
        groups[h.group] = groups[h.group] || [];
        groups[h.group].push(h);

        return h.group;
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
  }).help({
    name: 'help',
    description: 'Display a list of the available commands.',
    args: {
      command: 'The name of the command to display help information for.',
    },
  })
}
