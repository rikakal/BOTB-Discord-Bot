const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("generate-report")
        .setDescription("Generate a report on team details and creation in Discord")
        .setDefaultMemberPermissions(PermissionFlagsBits.CreateEvents),

    async execute(interaction) {
        await interaction.reply("Attemping to read from database to generate report...")

        let guildID = interaction.guild.id

        try {
            const response = await axios.get(`http://localhost:8000/api/database/report/${guildID}`)

            await interaction.channel.send(response.data.message);

        } catch (error) {
            console.error('Error generating report:', error.response?.data || error.message);

            await interaction.channel.send(`Failed to generate report: ${error.response?.data || error.message}`);
        }
    }
}