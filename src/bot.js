require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { Client, IntentsBitField, Collection, Events } = require('discord.js');

// Set specific intent bit flags so the bot can access/view/respond to messages
const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildMessageReactions,
    ]
})

// Bot logs in with secret token
client.login(process.env.TOKEN);

// Message in terminal to ensure bot has been started
client.once("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`)
})


// Dynamically load commands, which have been registered via running deploy-commands.js (persistent)
// Collection() is a map: key = command.name, value = command
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands'); // Go to commands folder
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js')); // Filter to get all .js files

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

// interactions
client.on(Events.InteractionCreate, async interaction => {
	//if (!interaction.isChatInputCommand()) return; // only respond to SlashCommands

    // if(interaction.isChatInputCommand()) {
    //     //console.log(interaction.user.id)
    //     const r = interaction.guild.roles.cache.find(r => r.name === 'BOTB Team Manager');

    //     console.log("user: ",  r)
    // }
    
	const command = client.commands.get(interaction.commandName);

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

module.exports = { client } // export only the client object created using discord.js