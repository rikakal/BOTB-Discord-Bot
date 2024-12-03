const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const XLSX = require('@e965/xlsx');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("generate-database")
        .setDescription("Loads data to empty database ")
        .addAttachmentOption(option =>
            option.setName('file')
                .setDescription('Excel sheet in .xlsx format')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.CreateEvents),

    async execute(interaction) {
        const attachment = interaction.options.getAttachment('file');
        if (!attachment.contentType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') { // specific type to .xlsx
            interaction.channel.reply("File isn't .xlsx format.");
            return;
        }

        await interaction.reply("Attemping to read file to generate database...")

        // Files sent in Discord are stored in their CDN, which generates a unique URL
        const response = await axios.get(attachment.url, { responseType: 'arraybuffer' });

        // parse using the XLSX library from @e965 and convert the Excel sheet to JSON
        const workbook = XLSX.read(response.data, { type: 'buffer' });
        const workSheet = workbook.SheetNames[0];
        const databaseJSON = XLSX.utils.sheet_to_json(workbook.Sheets[workSheet]);

        try {
            const response = await axios.post('http://localhost:8000/api/database/load', {
                databaseJSON
            })

            await interaction.channel.send(response.data.message);
            await interaction.channel.send(JSON.stringify(response.data.teams, null, 2));

        } catch (error) {
            console.error('Error loading database:', error.response?.data || error.message);

            await interaction.channel.send(`Failed to load database: ${error.response?.data || error.message}`);
        }
    },
};