require('dotenv').config();
const channelService = require('../services/channelService')

exports.createChannels = async (req, res) => {
    const { guildID, reason } = req.body
    try {
        let response = await channelService.createChannels(guildID, reason)
        return res.status(200).json({
            message: response,
        });
    } catch (error) {
        console.log("ERROR: ", error.message)
        return res.status(500).send(error.message)
    }
}

exports.assignChannels = async (req, res) => {
    const { guildID } = req.body
    try {
        let response = await channelService.assignChannels(guildID)
        return res.status(200).json({
            message: response,
        });
    } catch (error) {
        console.log("ERROR: ", error.message)
        return res.status(500).send(error.message)
    }
}

exports.deleteChannels = async (req, res) => {
    const { guildID } = req.body
    try {
        let response = await channelService.deleteChannels(guildID)
        return res.status(200).json({
            message: response,
        });
    } catch (error) {
        console.log("ERROR: ", error.message)
        return res.status(500).send(error.message)
    }
}