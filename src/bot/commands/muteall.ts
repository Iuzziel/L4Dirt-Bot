import { Message } from "discord.js";
import { ICommands } from ".";

const muteall: ICommands = {
    name: 'muteall',
    roles: ['@admin'],
    description: 'Couper le son de toutes les personnes dans le canal vocal de l\'expéditeur de la commande.',
    execute(message: Message) {
        if (!message.member || !message.guild) return;
        if (message.member?.roles.highest.id !== message.guild?.roles.highest.id) return;
        message.guild.channels.cache
            .filter(channel => channel.type === 'voice')
            .map(channel => channel.members.find(member => member.id === message.author.id))
            .forEach(member => {
                member?.voice.setSelfMute(true);
            });
        message.channel.send('Serveur en sourdine.');
    },
};
export default muteall;