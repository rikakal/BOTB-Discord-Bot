const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("delete-database")
        .setDescription("CAUTION: DELETES ALL DATA IN MONGODB DATABASE"),

    async execute(interaction) {
        const filter = (reaction, user) => {
            return ['✅', '❌'].includes(reaction.emoji.name) && user.id === interaction.user.id;
        };

        try {
            let message = await interaction.reply({
                content: "Are you sure you want to **delete all data in database**? To delete database data, use ``/delete-channels-roles`` instead. React with ✅ to confirm, or ❌ to cancel. ⚠️**WARNING: THIS WILL NOT DELETE CHANNELS AND ROLES CREATED WITH THE BOT.**⚠️",
                fetchReply: true,
            });

            // Add the initial reactions
            await message.react('✅');
            await message.react('❌');

            const collector = message.createReactionCollector({ filter, time: 30000 });
            collector.on('collect', async (reaction, user) => {
                console.log(`Collected ${reaction.emoji.name} from ${user.tag}`);
                collector.stop('Collector stopped manually')

                if (reaction.emoji.toString() === '✅') {
                    await interaction.followUp('Confirmed! Attempting to delete data from database...');

                    try {
                        let response = await axios.delete('http://localhost:8000/api/database/delete')
                        await interaction.channel.send(response.data.message)
                    } catch (error) {
                        console.error('Error deleting database:', error.response?.data || error.message);

                        await interaction.channel.send(`Failed to delete database: ${error.response?.data || error.message}`);
                    }


                } else if (reaction.emoji.toString() === '❌') {
                    await interaction.followUp('Action canceled.');
                    console.log('Action canceled');
                }
            });

            collector.on('end', async (collected, reason) => {
                if (reason === 'time') {
                    await interaction.followUp('Time expired! No action was taken.');
                }
            });

        } catch (error) {
            await interaction.followUp('No confirmation received. Action canceled.');
            console.error('No reaction received in time.');
        }
    },
};