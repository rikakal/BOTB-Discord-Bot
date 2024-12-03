const roleService = require('../services/roleService')

exports.createRoles = async (req, res) => {
    const { guildID, reason } = req.body
    try {
        let response = await roleService.createRoles(guildID, reason)
        return res.status(200).json({
            message: response,
        });
    } catch (error) {
        console.log("ERROR: ", error.message)
        return res.status(500).send(error.message)
    }
}

exports.assignRoles = async (req, res) => {
    const { guildID } = req.body
    try {
        let response = await roleService.assignRoles(guildID)
        return res.status(200).json({
            message: response,
        });
    } catch (error) {
        console.log("ERROR: ", error.message)
        return res.status(500).send(error.message)
    }
}

exports.deleteRoles = async (req, res) => {
    const { guildID } = req.body
    try {
        let response = await roleService.deleteRoles(guildID)
        return res.status(200).json({
            message: response,
        });
    } catch (error) {
        console.log("ERROR: ", error.message)
        return res.status(500).send(error.message)
    }
}