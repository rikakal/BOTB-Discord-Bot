const Teams = require('../models/Teams');

// *** Context: gets all Team documents from database ***
exports.getTeams = async () => {
    try {
        return await Teams.find({})
    } catch (error) {
        throw new error
    }
}

// *** Context: updates a specified field Team document ***
exports.updateTeamField = async (teamID, field, value) => {
    try {
        const updateData = {};
        updateData[field] = value;  // dynamically set the field and value

        let updatedTeam = await Teams.findByIdAndUpdate(
            teamID,
            updateData,
            { new: true }  // return updated document
        );

        if (!updatedTeam) {
            throw new Error('Team not found');
        }

        return updatedTeam;

    } catch (error) {
        throw new Error(`Error updating team ${field}: ${error.message}`);
    }
}

// *** Context: checks the Team channels -- for reporting purposes ***
exports.checkTeamChannels = async (guild, team) => {
    let textC = "Text Channel: ";
    let voiceC = "Voice Channel: ";

    if (team.textChannelID !== null && guild.channels.cache.get(team.textChannelID))
        textC += '✅'
    else
        textC += '❌'

    if (team.textChannelID !== null && guild.channels.cache.get(team.textChannelID))
        voiceC += '✅'
    else
        voiceC += '❌'

    return { textC, voiceC };
};

// *** Context: checks the Team role -- for reporting purposes ***
exports.checkTeamRole = async (guild, team) => {
    let r = "Role: ";

    if (team.roleID !== null && guild.roles.cache.get(team.roleID))
        r += '✅'
    else
        r += '❌'

    return r;
};