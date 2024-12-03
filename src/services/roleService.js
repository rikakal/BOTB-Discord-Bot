const { client } = require('../bot')
const teamService = require('./teamService')
const playerService = require('./playerService')

// *** Context: from createRoles endpoint from controller ***
exports.createRoles = async (guildID, reasoning) => {
    try {
        // check if database is empty
        let teams = await teamService.getTeams();
        if (teams.length === 0) {
            throw new Error("Database is empty!");
        }

        // get Guild object from the guildID
        const guild = await client.guilds.fetch(guildID);
        const reason = reasoning;

        let rolesCreated = [] // created roles
        let rolesUpdated = [] // successful updates to team

        // traverse through all teams
        for (let team of teams) {
            console.log(`Processing team: ${team.name} (${team.acronym}), roleID: ${team.roleID}`);

            // if the roleID has not been set yet, to avoid creating duplicate roles per team if command ran again
            if (team.roleID === null) {
                try {
                    // create the role in Discord
                    const role = await this.createRole(guild, reason, team);

                    // push created role to rolesCreated[]
                    rolesCreated.push(role.name);

                    await teamService.updateTeamField(team._id, 'roleID', role.id)
                        .then(() => {
                            rolesUpdated.push(role.id);
                        });

                } catch (error) {
                    console.error(`Error during PUT request for team ${team.name}:`, error);
                }
            } else {
                console.log(`Skipping team ${team.name} (${team.acronym}), already has roleID: ${team.roleID}`);
            }
        }

        return {
            message: `Roles created: ${rolesCreated.length} | Roles associated with team in database: ${rolesUpdated.length}`,
            rolesCreated: rolesCreated,
            rolesUpdated: rolesUpdated
        };

    } catch (error) {
        console.log("ERROR: ", error)
        throw new Error(error.message)
    }
}

// *** Context: creates a role ***
exports.createRole = async (guild, reason, team) => {
    return await guild.roles.create({
        name: `${team.acronym} (${team.name})`,
        reason: reason,
        permissions: [],
    });
}

// *** Context: from assignRoles endpoint from controller ***
exports.assignRoles = async (guildID) => {
    try {
        // check if database is empty
        let teams = await teamService.getTeams();
        if (teams.length === 0) {
            throw new Error("Database is empty!");
        }

        // get Guild object from the guildID
        const guild = await client.guilds.fetch(guildID);

        // explicitly get the members and roles
        await guild.members.fetch();
        await guild.roles.fetch();

        let membersNotInServer = [] // array of Discord usernames that couldn't be found in the Discord server (guild)
        let playersUpdated = 0 // # players who have roles assigned
        let playersErrored = 0 // # players where an error was encountered while assigning or finding Player document
        let missingRole = 0

        // traverse through all teams
        for (let team of teams) {
            if (team.roleID === null) {
                missingRole++;
                continue;
            }

            // retrieves the role from cache, which was loaded earlier with guilds.roles.fetch()
            // cache is of type Collection<K,V>
            const role = guild.roles.cache.get(team.roleID)
            console.log(`Processing team: ${team.name} (${team.acronym}) with role: ${role.name} (${team.roleID})`);

            // go through each player in the team
            for (let p of team.players) {
                console.log("Playuer: ", p)

                try {
                    // find the player from its ID first in order to update it
                    let player = await playerService.getPlayer(p.toString())
                        .catch(error => {
                            playersErrored++;
                            console.log(`ERROR: Failed to find player ${player.discord}. Response:`, error);
                        });

                    // find the player's Discord ID
                    const member = guild.members.cache.find(m =>
                        m.user.username === player.discord
                    );

                    // member exists
                    if (member) {
                        // add the role to the member
                        await member.roles.add(role);

                        // update the Player document with the Discord ID
                        await playerService.updatePlayerField(player._id, member.id)
                            .then(() => {
                                playersUpdated++;
                                console.log(`Player ${player.discord} updated successfully: ${member.id}`);
                            })
                            .catch(error => {
                                playersErrored++;
                                console.log(`ERROR: Failed to update player ${player.discord}. Response:`, error);
                            });

                    } else {
                        membersNotInServer.push(player.firstname + " " + player.lastname + " " + "(" + player.email + ") (" + player.discord + ")")
                    }

                } catch (error) {
                    console.error(`Error during PUT request for team ${team.name}:`, error);
                }
            }
        }

        return {
            message1: `Players updated (${playersUpdated}) | Player error during updating (${playersErrored})`,
            message2: `Players not in discord (${membersNotInServer.length}) | Teams missing role (${missingRole})`,
            membersNotInServer: membersNotInServer,
        };

    } catch (error) {
        console.log("ERROR: ", error)
        throw new Error(error.message)
    }
}

// *** Context: from deleteRoles endpoint from controller ***
exports.deleteRoles = async (guildID) => {
    try {
        // check if database is empty
        let teams = await teamService.getTeams();
        if (teams.length === 0) {
            throw new Error("Database is empty!");
        }

        // get Guild object from the guildID
        const guild = await client.guilds.fetch(guildID);

        await guild.roles.fetch();

        let rolesDeleted = 0;
        let rolesErrored = 0;
        let teamUpdateError = 0;

        for (let team of teams) {
            if (team.roleID === null)
                continue;
            const role = guild.roles.cache.get(team.roleID)
            await this.deleteRole(role)
                .then(() => {
                    rolesDeleted++
                })
                .catch(error => {
                    rolesErrored++;
                    console.log("Error: ", error)
                });
            console.log(`Processing team: ${team.name} (${team.acronym}) with role: ${role.name} (${team.roleID})`);

            // update the Team document
            await teamService.updateTeamField(team._id, 'roleID', null)
                .catch(error => {
                    teamUpdateError++;
                    console.error(`Error updating textChannel for team ${team.name}:`, error);
                })
        }

        return {
            message1: `Team roles deleted (${rolesDeleted}) | Team roles errored during trying to delete (${rolesErrored})`,
            message2: `Team update errors (${teamUpdateError})`,
        };

    } catch (error) {
        console.log("ERROR: ", error)
        throw new Error(error.message)
    }
}

// *** Context: deletes a role on Discord ***
exports.deleteRole = async (role) => {
    await role.delete('Deleting a BOTB team role')
}