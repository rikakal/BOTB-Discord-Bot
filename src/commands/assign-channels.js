const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("assign-channels")
        .setDescription("Assign text and voice channels for each team dynamically from database")
        .setDefaultMemberPermissions(PermissionFlagsBits.CreateEvents),

    async execute(interaction) {
        await interaction.reply("Attemping to read from database to assign channels...")

        let guildID = interaction.guild.id

        try {
            const response = await axios.put('http://localhost:8000/api/channel/assign', {
                guildID,
            });

            const { message1, message2, teamsMissingRoles, teamsMissingChannels } = response.data.message

            await interaction.channel.send(message1);
            await interaction.channel.send(message2);

            if (teamsMissingRoles && teamsMissingRoles.length > 0) {
                await interaction.channel.send(JSON.stringify(teamsMissingRoles));
            }
            if (teamsMissingChannels && teamsMissingChannels.length > 0) {
                await interaction.channel.send(JSON.stringify(teamsMissingChannels));
            }

        } catch (error) {
            console.error('Error assigning channels:', error.response?.data || error.message);

            await interaction.channel.send(`Failed to assigning channels: ${error.response?.data || error.message}`);
        }
    }
}