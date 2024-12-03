const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("delete-channels-roles")
        .setDescription("CAUTION: DELETES ALL CHANNELS AND ROLES"),

    async execute(interaction) {
        let guildID = interaction.guild.id;

        const filter = (reaction, user) => {
            return ['✅', '❌'].includes(reaction.emoji.toString()) && user.id === interaction.user.id;
        };

        try {
            let message = await interaction.reply({
                content: "Are you sure you want to delete **all team channels and roles** in the Discord? To delete the database, use ``/delete-database`` instead. React with ✅ to confirm, or ❌ to cancel.",
                fetchReply: true,
            });

            try {
                await message.react('✅');
                await message.react('❌');
            } catch (err) {
                console.error("Failed to react:", err);
                return await interaction.followUp("I couldn't add reactions. Please check my permissions!");
            }

            const collector = message.createReactionCollector({ filter, time: 30000 });
            collector.on('collect', async (reaction) => {
                console.log(`Collected ${reaction.emoji.toString()} from ${interaction.user.tag}`);
                collector.stop();

                if (reaction.emoji.toString() === '✅') {
                    await interaction.followUp('Confirmed! Attempting to delete all team channels and roles in Discord...');

                    // Delete roles
                    try {
                        const delResRole = await axios.put('http://localhost:8000/api/role/delete', { guildID });
                        const { message1, message2 } = delResRole.data.message
                        await interaction.channel.send(message1);
                        await interaction.channel.send(message2);

                    } catch (error) {
                        console.error('Error deleting channels:', error.response?.data || error.message);

                        await interaction.channel.send(`Error during deleting roles: ${error.response?.data || error.message}`);
                    }

                    // Delete channels
                    try {
                        const delResChan = await axios.put('http://localhost:8000/api/channel/delete', { guildID });
                        const { message1, message2 } = delResChan.data.message
                        await interaction.channel.send(message1);
                        await interaction.channel.send(message2);

                    } catch (error) {
                        console.error('Error deleting channels:', error.response?.data || error.message);

                        await interaction.channel.send(`Error deleting channels: ${error.response?.data || error.message}`);
                    }
                } else if (reaction.emoji.toString() === '❌') {
                    await interaction.followUp('Action canceled.');
                }
            });

            collector.on('end', async (_, reason) => {
                if (reason === 'time') {
                    await interaction.followUp('Time expired! No action was taken.');
                }
            });

        } catch (error) {
            console.error("Unexpected error:", error);
            await interaction.followUp("An unexpected error occurred. Please check the logs.");
        }
    },
};
