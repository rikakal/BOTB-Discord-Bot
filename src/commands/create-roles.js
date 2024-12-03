const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("create-roles")
        .setDescription("Creates roles dynamically from database")
        .setDefaultMemberPermissions(PermissionFlagsBits.CreateEvents),

    async execute(interaction) {
        await interaction.reply("Attemping to read from database to create roles...")

        let guildID = interaction.guild.id

        try {
            const response = await axios.post('http://localhost:8000/api/role/create', {
                guildID,
                reason: "Creating BOTB team role",
            });
            const { message, rolesCreated, rolesUpdated } = response.data.message

            await interaction.channel.send(message);

            // ensure we dont send an empty []
            if (rolesCreated && rolesCreated.length > 0) {
                await interaction.channel.send(JSON.stringify(rolesCreated));
            }
            if (rolesUpdated && rolesUpdated.length > 0) {
                await interaction.channel.send(JSON.stringify(rolesUpdated));
            }

        } catch (error) {
            console.error('Error creating roles:', error.response?.data || error.message);

            await interaction.channel.send(`Failed to create roles: ${error.response?.data || error.message}`);
        }
    }
}