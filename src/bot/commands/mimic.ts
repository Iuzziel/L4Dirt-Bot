import { Message, VoiceState } from 'discord.js';
import { ICommands } from '.';

const mimic: ICommands = {
    name: 'mimic',
    roles: ['@admin'],
    description: 'Mimic the command sender voice status for all people in voice channel.',
    guildOnly: true,
    execute(command: Message, args: string[] = []) {
        if (command.member?.roles.highest.id !== command.guild?.roles.highest.id) return;

        const _mimic = (oldState: VoiceState, newState: VoiceState) => {
            if (command.author.id === oldState.id) {
                const channel = command.guild?.channels.cache
                    .find(channel => channel.type === 'voice' && channel.members.some(member => member.id === command.author.id))
                if (channel === undefined) return;
                const members = channel.members;
                members.forEach(member => {
                    if (member.id !== command.author.id) {
                        member.voice.setSelfMute(!!newState.selfMute);
                    } else {
                        command.channel.send(`Server ${newState.mute ? 'muted' : 'unmuted'} by ${command.author.username}`)
                            .then(_message => setTimeout(() => _message.delete(), 5000));
                    }
                });
            }
        }

        if ((command.author.client.listeners('voiceStateUpdate').length > 0 && command.author.client.listeners('voiceStateUpdate').some(_listener => _listener.name === '_mimic'))
            || (args.length > 0 && args.some(arg => arg.toLowerCase() === 'off'))) {
            command.channel.send(`Stop mimic voice status on all user, required by ${command.author.username}`);
            return command.author.client.removeAllListeners('voiceStateUpdate');
        }
        command.channel.send(`Mimic voice status on user ${command.author.username}`);
        return command.author.client.on('voiceStateUpdate', _mimic);
    }
};
export default mimic;