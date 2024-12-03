const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("create-channels")
        .setDescription("Creates a BOTB category with channels dynamically from database")
        .setDefaultMemberPermissions(PermissionFlagsBits.CreateEvents),

    async execute(interaction) {
        await interaction.reply("Attemping to read from database to create the BOTB category and team channels...")

        let guildID = interaction.guild.id

        try {
            const response = await axios.post('http://localhost:8000/api/channel/create', {
                guildID,
                reason: "Creating BOTB Category",
            });

            const { message1, message2, textChannelsCreated, textChannelsUpdated, voiceChannelsCreated, voiceChannelsUpdated } = response.data.message

            await interaction.channel.send(message1)
            await interaction.channel.send(message2)

            // details regarding database
            if (textChannelsCreated && textChannelsCreated.length > 0) {
                await interaction.channel.send(JSON.stringify(textChannelsCreated));
            }
            if (textChannelsUpdated && textChannelsUpdated.length > 0) {
                await interaction.channel.send(JSON.stringify(textChannelsUpdated));
            }
            if (voiceChannelsCreated && voiceChannelsCreated.length > 0) {
                await interaction.channel.send(JSON.stringify(voiceChannelsCreated));
            }
            if (voiceChannelsUpdated && voiceChannelsUpdated.length > 0) {
                await interaction.channel.send(JSON.stringify(voiceChannelsUpdated));
            }

        } catch (error) {
            console.error('Error creating channels:', error.response?.data || error.message);

            await interaction.channel.send(`Failed to creating channels: ${error.response?.data || error.message}`);
        }
    }
}