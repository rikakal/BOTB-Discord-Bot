const teamService = require('../services/teamService')

exports.getTeams = async (req, res) => {
    try {
        const teams = await teamService.getTeams();
        return res.json(teams);

    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch teams' });
    }
}

exports.updateTeamRoleID = async (req, res) => {
    const { teamID } = req.params;
    const { roleID } = req.body;

    try {
        let updatedTeam = await teamService.updateTeamField(teamID, 'roleID', roleID);

        return res.status(200).json({
            message: 'Team role updated successfully',
            updatedTeam: updatedTeam
        });

    } catch (error) {
        console.error('Error updating team role:', error);
        return res.status(500).json({ message: 'Error updating team role', error: error.message });
    }
}

exports.updateTeamTextChannelID = async (req, res) => {
    const { teamID } = req.params;
    const { textChannelID } = req.body;

    try {
        let updatedTeam = await teamService.updateTeamField(teamID, 'textChannelID', textChannelID);

        return res.status(200).json({
            message: 'Team text channel updated successfully',
            updatedTeam: updatedTeam
        });

    } catch (error) {
        console.error('Error updating team text channel:', error);
        return res.status(500).json({ message: 'Error updating team role', error: error.message });
    }
}

exports.updateTeamVoiceChannelID = async (req, res) => {
    const { teamID } = req.params;
    const { voiceChannelID } = req.body;

    try {
        let updatedTeam = await teamService.updateTeamField(teamID, 'voiceChannelID', voiceChannelID);

        return res.status(200).json({
            message: 'Team voice channel updated successfully',
            updatedTeam: updatedTeam
        });

    } catch (error) {
        console.error('Error updating team voice channel:', error);
        return res.status(500).json({ message: 'Error updating team role', error: error.message });
    }
}