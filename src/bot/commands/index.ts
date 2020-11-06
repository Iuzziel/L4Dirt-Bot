import { Message } from 'discord.js';

import argsInfo from './argsInfo';
import avatar from './avatar';
import beep from './beep';
import help from './help';
import kick from './kick';
import meteo from './meteo';
import mimic from './mimic';
import muteall from './muteall';
import ping from './ping';
import prune from './prune';
import server from './server';
import unmuteall from './unmuteall';
import userInfo from './userInfo';

const commands = {
    argsInfo,
    avatar,
    beep,
    help,
    kick,
    meteo,
    mimic,
    muteall,
    ping,
    prune,
    server,
    unmuteall,
    userInfo
}
export default commands;

export interface ICommands {
    name: string,
    roles?: string[],
    aliases?: string[],
    argsRequired?: boolean,
    guildOnly?: boolean,
    cooldown?: number,
    description: string,
    usage?: string,
    execute: Function
}

export const isRoleCheckOk = (message: Message, command: keyof typeof commands): boolean => {
    if (!commands[command].roles) return true;
    if (commands[command].roles?.some(role => role === '@admin') && message.member?.roles.highest.id !== message.guild?.roles.highest.id) return false;
    throw new Error('Vérification du rôle échoué, commande inconnue.');
}

export const getAliasesWithCommandsName = (): Map<string, string> => {
    const _map = new Map<string, string>();
    for (const command of Object.values(commands)) {
        _map.set(command.name, command.name);
        if (command.aliases) {
            for (const alias in command.aliases) {
                _map.set(alias, command.name);
            }
        }
    }
    return _map;
}