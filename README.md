**THIS LIBRARY IS CURRENTLY A WIP**

![CI](https://github.com/butter-cookie-kitkat/discord-core/workflows/CI/badge.svg)

### Discord Core

#### Prerequisites

- [NodeJS v14+](https://nodejs.org)

### Usage

```sh
# This package isn't deployed to npm yet.
$ npm i -S git+https://git@github.com/butter-cookie-kitkat/discord-core.git
```

```js
import { DiscordBot } from '@butter-cookie-kitkat/discord-core';

const bot = new DiscordBot({
  token: '<your-discord-api-key-here>',
  prefix: '.',
});

bot.command('ping', async ({ message }) => {
  await message.reply('pong!');
});
```

### Caveats

In order to use `.mp3` files you need to provide the ffmpeg binaries.

This can be done fairly easily by adding `ffmpeg-static` to your dependencies.

#### Testing Locally

- Just install the dependencies via `npm i`.

- After that it's a simple as running `npm test`!
