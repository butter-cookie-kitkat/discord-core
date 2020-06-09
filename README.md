**THIS LIBRARY IS CURRENTLY A WIP**

![CI](https://github.com/butter-cookie-kitkat/kitkat-bot/workflows/CI/badge.svg)

### Kitkat Bot Core

#### Prerequisites

- [NodeJS v14+](https://nodejs.org)

### Usage

```sh
# This package isn't deployed to npm yet.
$ npm i -S git+https://git@github.com/butter-cookie-kitkat/kitkat-bot-core.git
```

```js
import { DiscordBot } from 'kitkat-bot-core';

const bot = new DiscordBot({
  token: '<your-discord-api-key-here>',
  prefix: '.',
});

bot.command('ping', async ({ message }) => {
  await message.reply('pong!');
});
```

#### Testing Locally

- Just install the dependencies via `npm i`.

- After that it's a simple as running `npm test`!
