const playerService = require('../services/playerService')

exports.getPlayer = async (req, res) => {
    const { playerID } = req.params;

    try {
        const player = await playerService.getPlayer(playerID)

        return res.status(200).json({
            message: 'Player found successfully',
            player: player
        });

    } catch (error) {
        console.error('Error finding player:', error);
        return res.status(500).json({ message: 'Error finding player', error: error.message });
    }
}

exports.updateDiscordID = async (req, res) => {
    const { playerID } = req.params;
    const { discordID } = req.body;

    try {
        let updatedPlayer = await playerService.updatePlayerField(playerID, 'discordID', discordID)

        return res.status(200).json({
            message: 'Player updated successfully',
            updatedPlayer: updatedPlayer
        });

    } catch (error) {
        console.error('Error updating player:', error);
        return res.status(500).json({ message: 'Error updating player', error: error.message });
    }
}