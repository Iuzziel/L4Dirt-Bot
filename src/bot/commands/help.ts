import { Message } from "discord.js";
import commands, { ICommands, getAliasesWithCommandsName } from ".";
import { botConfig } from '../../config/bot';

export const help: ICommands = {
    name: 'help',
    aliases: ['commands'],
    description: 'Liste toute les commandes, ou les infos spécifiques à une commande.',
    usage: '!help | !help <command name>',
    cooldown: 5,
    execute(message: Message, args: any) {
        const data = [];

        if (!args.length) {
            data.push('Voilà une liste de toutes les commandes:');
            data.push(Object.values(commands).map(command => command.name).join(', '));
            data.push(`\nVous pouvez envoyer \`${botConfig.prefix}help [command name]\` pour avoir des infos sur une commande spécifique.`);
        } else {
            if (!getAliasesWithCommandsName().has(args[0])) {
                return message.reply('Ce n\'est pas une commande valide!');
            }

            const command = Object.values(commands).find(command => command.name === getAliasesWithCommandsName().get(args[0]));
            if (!command) return;

            data.push(`**Name :** ${command.name}`);
            if (command.roles) data.push(`**Roles :** ${command.roles.join(', ')}`);
            if (command.description) data.push(`**Description :** ${command.description}`);
            if (command.aliases) data.push(`**Aliases :** ${command.aliases.join(', ')}`);
            if (command.usage) data.push(`**Utilisation :** ${botConfig.prefix}${command.name} ${command.usage}`);
            let _cd = command.cooldown !== undefined ? command.cooldown : botConfig.globalCooldown;
            data.push(`**Cooldown :** ${_cd} seconde(s)`);
        }

        message.author.send(data, { split: true })
            .then(() => {
                if (message.channel.type !== 'dm') {
                    message.channel.send(`${message.author.username}, je vous ai envoyé un message privé avec toutes les commandes.`);
                }
            })
            .catch(() => message.reply('Il semble que je ne puisse pas vous envoyer de message privé'));
    },
};
export default help;
