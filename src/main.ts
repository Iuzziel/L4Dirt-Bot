import { Left4DirtBot } from './bot';
import { server } from './web/server';

server.listen(process.env.PORT || 8080)
    .on('close', () => bot.emit('httpServerMessage', 'Server closed'))
    .on('connection', socket => bot.emit('httpServerMessage', 'Connexion sur le site internet du bot.'))
    .on('error', error => bot.emit('httpServerMessage', error));

export const bot = new Left4DirtBot();
bot.login();