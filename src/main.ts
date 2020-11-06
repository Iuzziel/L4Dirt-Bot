import { Left4DirtBot } from './bot';
import { server } from './web/server';

server.listen(process.env.PORT || 8080)
    .on('close', () => bot.emit('httpServerMessage', 'Server closed'))
    .on('error', error => bot.emit('httpServerMessage', error));

export const bot = new Left4DirtBot();
bot.login();