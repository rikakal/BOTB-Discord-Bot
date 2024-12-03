const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("assign-roles")
        .setDescription("Assign roles dynamically from database")
        .setDefaultMemberPermissions(PermissionFlagsBits.CreateEvents),

    async execute(interaction) {
        await interaction.reply("Attemping to read from database to assign roles...")

        let guildID = interaction.guild.id

        try {
            const response = await axios.put('http://localhost:8000/api/role/assign', {
                guildID,
            });
            const { message1, message2, membersNotInServer } = response.data.message

            await interaction.channel.send(message1);
            await interaction.channel.send(message2);

            // ensure we dont send an empty []
            if (membersNotInServer && membersNotInServer.length > 0) {
                await interaction.channel.send(JSON.stringify(membersNotInServer));
            }

        } catch (error) {
            console.error('Error assigning roles:', error.response?.data || error.message);

            await interaction.channel.send(`Failed to assigning roles: ${error.response?.data || error.message}`);
        }
    }
}