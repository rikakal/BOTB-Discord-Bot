const express = require('express')
const router = express.Router();
const { updateDiscordID, getPlayer } = require('../controllers/playerController')

router.get('/:playerID', getPlayer)
router.put('/:playerID/update-discordID', updateDiscordID)

module.exports = router;