import Discord, { Message, TextChannel } from 'discord.js';
import commands, { ICommands } from './commands';
import { botConfig } from '../config/bot';

export class Left4DirtBot {
    private botInstace: Discord.Client;
    private commands: Array<ICommands>;
    private cooldownQueue: Map<string, Map<string, number> | undefined>;

    constructor() {
        this.botInstace = new Discord.Client();
        this.cooldownQueue = new Map<string, Map<string, number> | undefined>();
        this.commands = this.injectCommands();
        this.registerEvents();
    }

    public login(): Promise<string> {
        return this.botInstace.login(botConfig.token);
    }

    private injectCommands(): Array<ICommands> {
        return Object.values(commands);
    }

    private registerEvents(): void {
        this.botInstace.on('ready', () => this.onReady());
        this.botInstace.on('message', (message) => this.onMessage(message));
    }

    private onMessage(message: Message): void {
        console.log(`[${message.createdAt.toLocaleTimeString()}]${message.guild ? ' - ' + message.guild.name : ''}${message.channel.type !== 'dm' ? ' - ' + (message.channel as TextChannel).name : ''} - ${message.author.username}: ${message.content} `);
        if (message.author.bot) return;
        this.parseAndExecuteCommand(message);
    }

    private parseAndExecuteCommand(message: Discord.Message) {
        return new Promise((resolve, reject) => {
            let isACommand = false;
            let usedPrefix = "";
            for (const item of botConfig.prefix) {
                if (message.content.startsWith(item)) {
                    isACommand = true;
                    usedPrefix = item;
                }
            }
            if (!isACommand) return reject('No command prefix detected');

            const args = message.content.slice(usedPrefix.length).split(/ +/);
            const cmdAsked = args.shift()?.toLowerCase();
            if (!cmdAsked) return reject('Prefix without command');

            const cmdFound = this.commands.find(cmd => cmd.name === cmdAsked || cmd.aliases && cmd.aliases.includes(cmdAsked));
            if (!cmdFound) return reject('Command not found');

            if (cmdFound.guildOnly && message.channel.type !== 'text') {
                return message.reply('Je ne peux pas executer cette commande dans un canal privé!');
            }

            if (cmdFound.argsRequired && args.length === 0) {
                let reply = `${message.author}, vous n'avez fournis aucun argument!`;
                if (cmdFound.usage) {
                    reply += `\nExemple d'utilisation: \`${usedPrefix}${cmdFound.name} ${cmdFound.usage ? cmdFound.usage : botConfig.prefix[0] + cmdFound.name}\``;
                }
                return message.channel.send(reply);
            }

            const now = Date.now();
            const cooldownAmount = (cmdFound.cooldown || botConfig.globalCooldown) * 1000;
            if (this.cooldownQueue.has(message.author.id)) {
                const cmdLastUsedTimestamp = this.cooldownQueue.get(message.author.id)?.get(cmdFound.name);
                if (cmdLastUsedTimestamp) {
                    const expirationDate = cmdLastUsedTimestamp + cooldownAmount;
                    if (now < expirationDate) {
                        const timeLeft = (expirationDate - now) / 1000;
                        return message.reply(`Attendez ${timeLeft.toFixed(1)} seconde(s) avant de réutiliser la commande: \`${cmdFound.name}\`.`);
                    }
                }
                this.cooldownQueue.set(message.author.id, this.cooldownQueue.get(message.author.id)?.set(cmdFound.name, now));
            } else {
                this.cooldownQueue.set(message.author.id, new Map<string, number>().set(cmdFound.name, now));
            }
            setTimeout(() => this.cooldownQueue.get(message.author.id)?.delete(cmdFound.name), cooldownAmount);

            try {
                return resolve(cmdFound.execute(message, args));
            } catch (error) {
                message.reply('Erreur dans l\'éxécution de la command!');
                return reject(error);
            }
        })
    }

    private onReady() {
        console.log(`${this.botInstace.user?.username} est en ligne`);
        return this.botInstace.user?.setActivity(`Alive. Type ${botConfig.prefix[0]}help for further info.`);
    }

    private setAvatar() {
        return this.botInstace.user?.setAvatar('./img/avatar.png')
            .then(() => console.log('Avatar mis en place avec succès'))
            .catch(console.error);
    }
}