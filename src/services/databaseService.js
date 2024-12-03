const mongoose = require('mongoose');
const { client } = require('../bot')
const Teams = require('../models/Teams');
const Players = require('../models/Players');
const teamService = require('./teamService')
const playerService = require('./playerService')
const channelService = require('./channelService')
const MAGIC_TEAM_SIZE = 2;

// *** Context: from deleteDatabase endpoint from controller ***
exports.deleteDatabase = async () => {
    try {
        // check if database empty first
        let teams = await teamService.getTeams();
        if (teams.length === 0) {
            throw new Error("Database is empty!");
        }

        // delete Team and Players collections
        await Teams.deleteMany({});
        await Players.deleteMany({});

    } catch (error) {
        throw new Error(error.message);
    }
}

// *** Context: from loadDatabase endpoint from controller ***
exports.loadDatabase = async (file) => {
    // start session, letting database now that transaction will occur
    let teamSession = await mongoose.startSession();
    let playerSession = await mongoose.startSession();

    // string to pass to client
    let teamDataArray = [];

    // check if database is empty
    try {
        let teams = await teamService.getTeams();
        if (teams.length > 0) {
            throw new Error("Database is not empty!");
        }
    } catch (error) {
        throw new Error(error.message);
    }

    try {
        // transaction of creating all players and teams from the Excel sheet
        teamSession.startTransaction();
        playerSession.startTransaction();

        // iterate through file
        for (let item of file) {
            const teamData = await this.iterateFile(item, teamSession, playerSession);
            teamDataArray.push(teamData);
        }

        // no errors while creating teams and players? commit transaction to save to database
        await playerSession.commitTransaction();
        await teamSession.commitTransaction();

        console.log("Database loaded!");

        return teamDataArray;

    } catch (error) { // abort transaction if any errors encountered
        console.error('Error loading into database:', error);
        await playerSession.abortTransaction();
        await teamSession.abortTransaction();
        throw new Error('Error loading data');

    } finally { // end session
        playerSession.endSession();
        teamSession.endSession();
    }
}

// *** Context: iterates through each row in excel sheet file ***
exports.iterateFile = async (item, teamSession, playerSession) => {
    const playersID = [];       // playerID from mongoDB, to be used when creating Team document
    const playerDiscord = [];   // player's Discord username

    // parse player data
    const playerData = await this.parsePlayerData(item, playerSession, playersID, playerDiscord);

    // create team data
    const teamData = await this.createTeamData(item, teamSession, playersID);

    // toString the team data
    const teamString = await this.teamDataToString(teamData, playerDiscord);

    return teamString;
}

// *** Context: parse player data from excel file based on column name. Creates Player document based on Player schema ***
exports.parsePlayerData = async (item, playerSession, playersID, playerDiscord) => {
    // extract based on column name!
    for (let i = 1; i <= MAGIC_TEAM_SIZE; i++) {    // ex: Player 1, Player 2, etc...
        const firstname = `Player ${i} (First Name)`;
        const lastname = `Player ${i} (Last Name)`;
        const email = `Player ${i} (Email)`;
        const discord = `Player ${i} (Discord Username)`;

        const player = new Players({
            firstname: item[firstname],
            lastname: item[lastname],
            email: item[email],
            discord: item[discord],
        });

        // save to session, not actually committed to database yet
        const savedPlayer = await player.save({ session: playerSession });

        playersID.push(savedPlayer._id);
        playerDiscord.push(savedPlayer.discord);
    }
}

// *** Context: create Team document based on Team schema ***
exports.createTeamData = async (item, teamSession, playersID) => {
    const team = new Teams({
        name: item['Team Name'],
        acronym: item['Team Acronym'],
        players: playersID, // array of all Player documents created
    });

    // save to session, not actually committed to database yet
    await team.save({ session: teamSession });

    return team;
}

// *** Context: return details of the Team document into readable string to client ***
exports.teamDataToString = async (team, playerDiscord) => {
    return {
        teamName: team.name,
        teamAcronym: team.acronym,
        playersDiscord: playerDiscord.join(', '),
    };
}

// *** Context: from generateReport endpoint from controller ***
exports.generateReport = async (guildID) => {
    try {
        // check if there are any teams to report on
        let teams = await teamService.getTeams();
        if (teams.length === 0) {
            throw new Error("No teams found. Please load the database first.");
        }

        // get Guild object
        const guild = await client.guilds.fetch(guildID);

        // get all members and roles
        await guild.members.fetch();
        await guild.roles.fetch();

        // array to send details to the client
        let details = [];

        // iterate over each team
        for (let team of teams) {
            // formatted team name + acronym
            let t = `**${team.name} (${team.acronym})**`;

            // check team channels and role
            const { textC, voiceC } = await teamService.checkTeamChannels(guild, team);
            const r = await teamService.checkTeamRole(guild, team);

            // check if the role has access to the channels
            // ✅ - role has access to the channel
            // ❌ - role doesn't have access to the channel
            // ⚠️ - no role was created 
            let accessTextC = false;
            let accessVoiceC = false;
            let accessTextCString = "Access to text channel? ";
            let accessVoiceCString = "Access to voice channel? ";

            // checking if role has access to text channel
            if (team.textChannelID !== null && team.roleID !== null) {
                accessTextC = await channelService.doesRoleHaveAccessToChannel(guild, team.textChannelID, team.roleID);
                if (accessTextC === true) {
                    accessTextCString += '✅'
                }
                else {
                    accessTextCString += '❌'
                }
            }
            else {
                accessTextCString += '⚠️'
            }

            // checking if role has access to voice channel
            if (team.voiceChannelID !== null && team.roleID !== null) {
                accessVoiceC = await channelService.doesRoleHaveAccessToChannel(guild, team.voiceChannelID, team.roleID)
                if (accessVoiceC === true) {
                    accessVoiceCString += '✅'
                }
                else {
                    accessVoiceCString += '❌'
                }
            } else {
                accessVoiceCString += '⚠️'
            }

            // player statistics
            let playerStat = "Players: ";
            let playersErrored = 0;
            let playersNotInDiscord = [];
            let playersMissingRole = [];

            // get the player details
            for (let p of team.players) {
                await playerService.playerStats(p, guild, team.roleID, playersErrored, playersNotInDiscord, playersMissingRole)
            }

            // create player stats string (ex: in Discord, has role, any errors while retrieving to database)
            let playerStatString = await playerService.playerStatsToString(team.roleID, playerStat, playersErrored, playersNotInDiscord, playersMissingRole)

            // combined and formatted details of the team 
            let combined = `${t}\n${textC}\n${voiceC}\n${r}\n${accessTextCString}\n${accessVoiceCString}\n` + `${playerStatString}`;

            // push string to details array
            details.push(combined);
        }

        // join details[] into string with separator
        let finalDetails = details.join("\n----------------------------------------\n");

        return finalDetails;

    } catch (error) {
        console.log("ERROR: ", error);
        throw new Error("Error generating report: " + error.message);
    }
};
