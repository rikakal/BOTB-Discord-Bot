const Players = require('../models/Players');
const MAGIC_TEAM_SIZE = 2;

// *** Context: gets a Player document by it's id from the database ***
exports.getPlayer = async (playerID) => {
    try {
        const player = await Players.findById(playerID)

        if (!player)
            throw new error('Player not found');

        return player

    } catch (error) {
        throw new error
    }
}

// *** Context: updates a specified field Player document ***
exports.updatePlayerField = async (playerID, field, value) => {
    try {
        const updateData = {};
        updateData[field] = value;  // dynamically set the field and value

        let updatedPlayer = await Players.findByIdAndUpdate(
            playerID,
            updateData,
            { new: true }  // return updated document
        );

        if (!updatedPlayer) {
            throw new Error('Player not found');
        }

        return updatedPlayer;

    } catch (error) {
        throw new Error(`Error updating player ${field}: ${error.message}`);
    }
}


// *** Context: checks if the player has the role in Discord server ***
exports.checkPlayerRole = async (member, roleID) => {
    return member.roles.cache.has(roleID);
};

// *** Context: checks if the player is in the Discord server ***
exports.checkPlayerInDiscord = async (guild, player) => {
    let member = guild.members.cache.get(player.discordID);
    if (!member) { // discordID not set yet bc /assign-roles hasnt been issued
        member = await guild.members.cache.find(m => m.user.username === player.discord);
    }
    return member;
};

// *** Context: player details -- for reporting purposes ***
exports.playerStats = async (p, guild, roleID, playersErrored, playersNotInDiscord, playersMissingRole) => {
    let player;
    try {
        player = await this.getPlayer(p);
    } catch (error) {
        playersErrored++;
        console.log(`ERROR: Failed to find player ${p.discord}. Response:`, error);
    }

    // check if player is in server (guild)
    const member = await this.checkPlayerInDiscord(guild, player);

    if (member) { // in server
        if (roleID !== null && !(await this.checkPlayerRole(member, roleID))) {
            playersMissingRole.push(
                `> - Name: ${player.firstname} ${player.lastname}\n` +
                `> - Email: ${player.email}\n` +
                `> - Discord: ${player.discord}`
            );
        }
    } else { // Not in server
        playersNotInDiscord.push(
            `> - Name: ${player.firstname} ${player.lastname}\n` +
            `> - Email: ${player.email}\n` +
            `> - Discord: ${player.discord}`
        );
    }
}

// *** Context: formats the player details -- for reporting purposes ***
exports.playerStatsToString = async (roleID, playerStat, playersErrored, playersNotInDiscord, playersMissingRole) => {
    if (playersErrored === 0 && playersNotInDiscord.length === 0 && playersMissingRole.length === 0) {
        playerStat += roleID === null ? '⚠️' : '✅';
    } else {
        playerStat += `❌ ${MAGIC_TEAM_SIZE - playersErrored - playersNotInDiscord.length - playersMissingRole.length}/${MAGIC_TEAM_SIZE}`;
    }

    return `${playerStat}\n` +
        `Errored from database: ${playersErrored}\n` +
        `Not in Discord: ${playersNotInDiscord.length}\n${playersNotInDiscord.join('\n--\n')}` +
        (playersNotInDiscord.length === 0 ? '' : '\n') +
        `Missing team role: ${playersMissingRole.length}\n${playersMissingRole.join('\n--\n')}`;
}