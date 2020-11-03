const Discord = require('discord.js');
const fs = require('fs');
const client = new Discord.Client();
client.commands = new Discord.Collection();
const cooldowns = new Discord.Collection();
module.id = 'main';

exports.config = config = function () {
	let config;
	if (fs.existsSync('./config.json')) {
		config = require('./config.json');
	} else {
		if (process.env.DISCORD_TOKEN) {
			Object.assign(config.token, process.env.DISCORD_TOKEN);
		}
		if (process.env.DISCORD_PREFIX) {
			Object.assign(config.prefix, process.env.DISCORD_PREFIX);
		}
		if (process.env.DISCORD_WEATHER_KEY) {
			Object.assign(config.weatherApiKey, process.env.DISCORD_WEATHER_KEY);
		}
	}
	return config;
}

const commandFiles = fs.readdirSync('./commands');

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

client.on('ready', () => {
	console.log(`${client.user.username} est en ligne`);
	client.user.setActivity('En test, ne pretez pas attention');
	// client.user.setAvatar('./img/avatar.png')
	// 	.then(() => console.log('Avatar mis en place avec succès'))
	// 	.catch(console.error);
});

client.on('message', (message) => {
	try {
		console.log(`[${message.createdAt.toUTCString()}]${message.guild ? ' - ' + message.guild.name : ''} - ${message.channel.name} - ${message.author.username}: ${message.content}`);
	} catch (error) {
		console.error(error);
	}

	if (message.author.bot) return;

	let isACommand = false;
	let usedPrefix = "";
	for (const item of config().prefix) {
		if (message.content.startsWith(item)) {
			isACommand = true;
			usedPrefix = item;
		}
	}
	if (!isACommand) return;

	const args = message.content.slice(usedPrefix.length).split(/ +/);
	const commandName = args.shift().toLowerCase();

	const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;

	if (command.guildOnly && message.channel.type !== 'text') {
		return message.reply('Je ne peux pas executer cette commande dans un canal privé!');
	}

	if (command.args && !args.length) {
		let reply = `${message.author}, vous n'avez fournis aucun argument!`;

		if (command.usage) {
			reply += `\nExemple d'utilisation: \`${usedPrefix}${command.name} ${command.usage}\``;
		}

		return message.channel.send(reply);
	}

	if (!cooldowns.has(command.name)) {
		cooldowns.set(command.name, new Discord.Collection());
	}

	const now = Date.now();
	const timestamps = cooldowns.get(command.name);
	const cooldownAmount = (command.cooldown || 3) * 1000;

	if (!timestamps.has(message.author.id)) {
		timestamps.set(message.author.id, now);
		setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
	} else {
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;
			return message.reply(`Attendez ${timeLeft.toFixed(1)} seconde(s) avant de réutiliser la commande: \`${command.name}\`.`);
		}

		timestamps.set(message.author.id, now);
		setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
	}

	try {
		command.execute(message, args);
	} catch (error) {
		console.error(error);
		message.reply('Erreur dans l\'éxécution de la command!');
	}
});

client.on('guildMemberAdd', (member) => {
	const channel = member.guild.channels.find('name', 'member-log');

	if (!channel) return;
	channel.send(`Bienvenu sur le serveur des Left4Dirt, ${member}`);
});

client.login(config().token);
