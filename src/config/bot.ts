import fs from 'fs';
import path from 'path';

export let botConfig: IBotConfig = ((): IBotConfig => {
    let _configuration: IBotConfig;
    if (fs.existsSync(path.resolve(__dirname, '../../config.json'))) {
        _configuration = require(path.resolve(__dirname, '../../config.json')).bot;
    } else {
        _configuration = {
            token: '',
            prefix: [
                "!",
                "?"
            ],
            weatherApiKey: '',
            globalCooldown: 3
        };
        if (process.env.L4DB_DISCORD_TOKEN) {
            _configuration.token = process.env.L4DB_DISCORD_TOKEN;
        }
        if (process.env.L4DB_DISCORD_PREFIX) {
            _configuration.prefix = new Array(process.env.L4DB_DISCORD_PREFIX);
        }
        if (process.env.L4DB_DISCORD_WEATHER_KEY) {
            _configuration.weatherApiKey = process.env.L4DB_DISCORD_WEATHER_KEY;
        }
        if (process.env.L4DB_DISCORD_GCD) {
            _configuration.globalCooldown = Number.parseInt(process.env.L4DB_DISCORD_GCD);
        }
        if (process.env.L4DB_DISCORD_LOG_CHANNEL_ID) {
            Object.assign(_configuration, { log: { channelId: process.env.L4DB_DISCORD_LOG_CHANNEL_ID } });
        }
    }
    return _configuration;
})()

interface IBotConfig {
    token: string,
    prefix: Array<string>,
    weatherApiKey: string,
    globalCooldown: number,
    log?: {
        channelId: string
    }
}