import { Message } from "discord.js";
import { ICommands } from ".";

const server: ICommands = {
    name: 'server',
    description: 'Affiche les infos du servers.',
    execute(message: Message) {
        if (message.guild) {
            message.channel.send(`Serveur : ${message.guild.name}\nTotal des membres : ${message.guild.memberCount}`);
        } else {
            message.channel.send(`Information inconnue sur ce canal...`);
        }
    },
};
export default server;