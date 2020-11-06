import { Message, VoiceState } from 'discord.js';
import { ICommands } from '.';

const mimic: ICommands = {
    name: 'mimic',
    roles: ['@admin'],
    description: 'Imiter l\'état de la voix de l\'expéditeur de la commande pour toutes les personnes du canal vocal.',
    guildOnly: true,
    execute(command: Message, args: string[] = []) {
        if (command.member?.roles.highest.id !== command.guild?.roles.highest.id) return;

        const _mimic = (oldState: VoiceState, newState: VoiceState) => {
            if (command.author.id === oldState.id) {
                const channel = command.guild?.channels.cache
                    .find(channel => channel.type === 'voice' && channel.members.some(member => member.id === command.author.id))
                if (channel === undefined) return;
                const members = channel.members;
                for (const [_id, member] of members.entries()) {
                    if (member.id !== command.author.id)
                        member.voice.setMute(!!newState.selfMute);
                    else
                        command.channel.send(`Serveur ${newState.mute ? 'en sourdine' : 'réactivation de la voix'} demandé par ${command.author.username}`)
                            .then(_message => setTimeout(() => _message.delete(), 5000));
                }
            }
        }

        if ((command.author.client.listeners('voiceStateUpdate').length > 0 && command.author.client.listeners('voiceStateUpdate').some(_listener => _listener.name === '_mimic'))
            || (args.length > 0 && args.some(arg => arg.toLowerCase() === 'off'))) {
            command.channel.send(`Arrête de mimer l'état de la voix, action demandé par ${command.author.username}`);
            command.author.client.removeAllListeners('voiceStateUpdate');
        } else {
            command.channel.send(`Imite l'état de la voix de l'utilisateur ${command.author.username}`);
            command.author.client.on('voiceStateUpdate', _mimic);
        }
    }
};
export default mimic;