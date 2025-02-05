require('dotenv').config();
const { client } = require('../bot')
const { ChannelType, PermissionFlagsBits } = require('discord.js');
const MAGIC_TEXT_CATEGORY_NAME = "BOTB"
const teamService = require('./teamService')

// *** Context: checks if a role has access to a channel ***
exports.doesRoleHaveAccessToChannel = async (guild, channelID, roleID) => {
    const channel = await guild.channels.cache.get(channelID); // get Channel object
    const permissions = channel.permissionOverwrites.cache.get(roleID); // try to find the role and its permissions
    if (permissions === undefined) { // didn't find the role in the channel
        return false;
    } else if (!permissions) {       // no overwrites found for the role, meaning it inherits default permissions
        return false;
    }
    return true;
};

// *** Context: from createChannels endpoint from controller ***
exports.createChannels = async (guildID, reasoning) => {
    try {
        // check if database is empty
        let teams = await teamService.getTeams();
        if (teams.length === 0) {
            throw new Error("Database is empty!");
        }

        // get Guild object from the guildID
        const guild = await client.guilds.fetch(guildID);
        const reason = reasoning;

        // get the bot and check/find its admin role
        const botMember = guild.members.cache.get(process.env.CLIENTID);
        const adminRole = botMember.roles.cache.find(role => role.permissions.has("Administrator"));
        console.log(adminRole);

        // create category first, which is where all the channels will populate under
        let textCategory;
        try {
            textCategory = await this.createCategory(guild, reason, adminRole.id);
        } catch (error) {
            console.error(`Error creating category:`, error);
            throw new Error(error.message)
        }

        let textChannelsCreated = [] // created text channels
        let textChannelsUpdated = [] // successful updates to team
        let voiceChannelsCreated = [] // created voice channels
        let voiceChannelsUpdated = [] // successful updates to team        

        // traverse through all teams
        for (let team of teams) {
            console.log(`Processing team: ${team.name} (${team.acronym}), roleID: ${team.roleID}`);

            // avoid creating duplicate text channel per team if command ran again
            if (team.textChannelID === null) {
                try {
                    // create the text channel in Discord
                    let channel = await this.createChannel(guild, ChannelType.GuildText, textCategory.id, team)

                    // push created text channel
                    textChannelsCreated.push(channel.name)

                    // update Team document with the new textChannelID
                    await teamService.updateTeamField(team._id, 'textChannelID', channel.id)
                        .then(() => {
                            textChannelsUpdated.push(channel.id);
                        });

                } catch (error) {
                    console.error(`Error during PUT request for team ${team.name}:`, error);
                }
            } else {
                console.log(`Skipping team ${team.name} (${team.acronym}), already has textChannelID: ${team.textChannelID}`);
            }

            if (team.voiceChannelID === null) {
                try {
                    // create the text channel in Discord
                    let channel = await this.createChannel(guild, ChannelType.GuildVoice, textCategory.id, team)

                    // push created voice channel
                    voiceChannelsCreated.push(channel.name)

                    // update Team document with the new voiceChannelID
                    await teamService.updateTeamField(team._id, 'voiceChannelID', channel.id)
                        .then(() => {
                            voiceChannelsUpdated.push(channel.id);
                        });

                } catch (error) {
                    console.error(`Error during PUT request for team ${team.name}:`, error);
                }
            } else {
                console.log(`Skipping team ${team.name} (${team.acronym}), already has voiceChannelID: ${team.voiceChannelID}`);
            }
        }

        return {
            message1: `Text channels created (${textChannelsCreated.length}) | Text channels associated with team in database (${textChannelsUpdated.length})`,
            message2: `Voice channels created (${voiceChannelsCreated.length}) | Voice channels associated with team in database (${voiceChannelsUpdated.length})`,

            textChannelsCreated: textChannelsCreated,
            textChannelsUpdated: textChannelsUpdated,
            voiceChannelsCreated: voiceChannelsCreated,
            voiceChannelsUpdated: voiceChannelsUpdated,
        };

    } catch (error) {
        console.log("ERROR: ", error)
        throw new Error(error.message)
    }
}

// *** Context: creates a category ***
exports.createCategory = async (guild, reason, botAdminRoleId) => {
    return await guild.channels.create({
        name: MAGIC_TEXT_CATEGORY_NAME,
        type: ChannelType.GuildCategory,
        reason: reason,
        permissionOverwrites: [
            {
                id: guild.roles.everyone.id, // default role (@everyone)
                deny: [PermissionFlagsBits.ViewChannel], // deny access for everyone
            },
            {
                id: botAdminRoleId,
                allow: [
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.ManageRoles,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.ReadMessageHistory
                ],
            },
        ],
    });
}

// *** Context: creates either a text or voice channel ***
exports.createChannel = async (guild, type, parent, team) => {
    return await guild.channels.create({
        name: `${team.name}-${team.acronym}`,
        type: type,
        parent: parent,
        permissionOverwrites: [
            {
                id: guild.roles.everyone.id,
                deny: [PermissionFlagsBits.ViewChannel],
            }
        ]
    });
}

// *** Context: from assignChannels endpoint from controller ***
exports.assignChannels = async (guildID) => {
    try {
        // check if database is empty
        let teams = await teamService.getTeams();
        if (teams.length === 0) {
            throw new Error("Database is empty!");
        }

        // get Guild object from the guildID
        const guild = await client.guilds.fetch(guildID);

        // explicitly get the roles (channels is automatically cached)
        await guild.roles.fetch();

        let channelsUpdated = 0
        let channelsErrored = 0
        let teamsMissingRoles = []
        let teamsMissingChannels = []

        for (let team of teams) {
            console.log(`Processing team: ${team.name} (${team.acronym}), roleID: ${team.roleID}`);

            // check if role and channels have been assigned
            if (team.textChannelID !== null && team.voiceChannelID !== null && team.roleID !== null) {
                let textChannel = guild.channels.cache.get(team.textChannelID)
                let voiceChannel = guild.channels.cache.get(team.voiceChannelID)
                let roleID = guild.roles.cache.get(team.roleID).id

                // now edit the textChannel with permissions for the role
                await this.editTextChannelPermissions(textChannel, roleID)
                    .then(() => {
                        console.log('Text permissions updated successfully!');
                        channelsUpdated++;
                    })
                    .catch(error => {
                        console.error('Failed to update text permissions:', error);
                        channelsErrored++;
                    });

                // then the voiceChannel
                await this.editVoiceChannelPermissions(voiceChannel, roleID)
                    .then(() => {
                        console.log('Voice permissions updated successfully!');
                        channelsUpdated++;
                    })
                    .catch(error => {
                        console.error('Failed to update voice permissions:', error);
                        channelsErrored++;
                    });

            } else {
                if (team.textChannelID === null || team.voiceChannelID === null)
                    teamsMissingChannels.push(team.name + "(" + team.acronym + ")")
                if (team.roleID === null)
                    teamsMissingRoles.push(team.name + "(" + team.acronym + ")")
            }
        }

        return {
            message1: `Channels assigned (${channelsUpdated}) | Channels errored during setting permissions (${channelsErrored})`,
            message2: `Teams missing channels (${teamsMissingChannels.length}) | Teams missing roles (${teamsMissingRoles.length})`,
            teamsMissingRoles: teamsMissingRoles,
            teamsMissingChannels: teamsMissingChannels,
        };

    } catch (error) {
        console.log("ERROR: ", error)
        throw new Error(error.message)
    }
}

// *** Context: edit text channel permissions per team ***
exports.editTextChannelPermissions = async (textChannel, roleID) => {
    await textChannel.permissionOverwrites.edit(roleID,
        {
            ViewChannel: true,
            SendMessages: true,
            AttachFiles: true,
            AddReactions: true,
            UseExternalEmojis: true,
            UseExternalStickers: true,
            ReadMessageHistory: true,
            EmbedLinks: true,
            SendVoiceMessages: true,
        }
    )
}

// *** Context: edit voice channel permissions per team ***
exports.editVoiceChannelPermissions = async (voiceChannel, roleID) => {
    await voiceChannel.permissionOverwrites.edit(roleID,
        {
            ViewChannel: true,
            Connect: true,
            Speak: true,
            Stream: true,
            UseSoundboard: true,
            UseExternalSounds: true,
            UseVAD: true,
        }
    )
}

// *** Context: from deleteChannels endpoint from controller ***
exports.deleteChannels = async (guildID) => {
    try {
        // check if database is empty
        let teams = await teamService.getTeams();
        if (teams.length === 0) {
            throw new Error("Database is empty!");
        }

        // get Guild object from the guildID
        const guild = await client.guilds.fetch(guildID);

        // explicitly get the roles (channels is automatically cached)
        await guild.roles.fetch();

        let channelsDeleted = 0;
        let channelsErrored = 0;
        let teamUpdateError = 0

        // *** NOTE: may need to be updated to check each Team document
        // this is bc it ASSUMES that the very first Team document doesn't have null textChannelID.
        let parentCategory = null;
        if (teams[0].textChannelID !== null)
            parentCategory = guild.channels.cache.get(teams[0].textChannelID).parent

        for (let team of teams) {
            // deleting text channels first
            if (team.textChannelID === null)
                continue;
            let channel = guild.channels.cache.get(team.textChannelID)
            await this.deleteChannel(channel)
                .then(() => {
                    channelsDeleted++
                })
                .catch(error => {
                    channelsErrored++;
                    console.log("Error: ", error)
                })
            console.log(`Processing team: ${team.name} (${team.acronym}) with text channel: ${channel.name} (${channel.textChannelID})`);

            // then voice channels
            if (team.voiceChannelID === null)
                continue;
            console.log(`Processing team: ${team.name} (${team.acronym}) with voice channel: ${channel.name} (${channel.voiceChannelID})`);
            channel = guild.channels.cache.get(team.voiceChannelID)
            await this.deleteChannel(channel)
                .then(() => {
                    channelsDeleted++
                })
                .catch(error => {
                    channelsErrored++;
                    console.log("Error: ", error)
                })

            // update the Team document for text and voice channel
            await teamService.updateTeamField(team._id, 'textChannelID', null)
                .catch(error => {
                    teamUpdateError++;
                    console.error(`Error updating textChannel for team ${team.name}:`, error);
                });
            await teamService.updateTeamField(team._id, 'voiceChannelID', null)
                .catch(error => {
                    teamUpdateError++;
                    console.error(`Error updating textChannel for team ${team.name}:`, error);
                });
        }

        if (parentCategory !== null) {
            if (parentCategory !== 'undefined') {
                console.log("Parent category exists: ", parentCategory)
                await this.deleteChannel(parentCategory)
                    .then(() => {
                        channelsDeleted++
                    })
                    .catch(error => {
                        channelsErrored++;
                        console.log("Error: ", error)
                    })
            }
        }

        return {
            message1: `Team channels deleted (${channelsDeleted}) | Team channels errored during trying to delete (${channelsErrored})`,
            message2: `Team update errors (${teamUpdateError})`,
        };

    } catch (error) {
        console.log("ERROR: ", error)
        throw new Error(error.message)
    }
}

// *** Context: deletes a channel on Discord ***
exports.deleteChannel = async (channel) => {
    await channel.delete('Deleting a team text channel')
}