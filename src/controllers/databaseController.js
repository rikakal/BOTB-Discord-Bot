const databaseService = require('../services/databaseService')

exports.generateReport = async (req, res) => {
    const { guildID } = req.params
    try {
        let report = await databaseService.generateReport(guildID)
        return res.status(200).json({
            message: report,
        });
    } catch (error) {
        console.log("ERROR: ", error.message)
        return res.status(500).send(error.message)
    }
}

exports.deleteDatabase = async (req, res) => {
    await databaseService.deleteDatabase()
        .then(() => {
            return res.status(200).json({ message: "Deleted data in database" })
        })
        .catch((error) => {
            console.log("ERROR: ", error.message)
            return res.status(500).send(error.message)
        })
}

exports.loadDatabase = async (req, res) => {
    // databaseJSON is of type JSON array
    const { databaseJSON } = req.body;

    try {
        let generated = await databaseService.loadDatabase(databaseJSON)
        return res.status(200).json({
            message: 'Database loaded successfully',
            teams: generated,
        });
    } catch (error) {
        console.log("ERROR: ", error.message)
        return res.status(500).send(error.message)
    }
}