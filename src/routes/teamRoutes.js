const express = require('express')
const router = express.Router();
const { getTeams, updateTeamRoleID, updateTeamTextChannelID, updateTeamVoiceChannelID } = require('../controllers/teamController')

router.get('/', getTeams);
router.put('/:teamID/update-role', updateTeamRoleID)
router.put('/:teamID/update-textChannel', updateTeamTextChannelID)
router.put('/:teamID/update-voiceChannel', updateTeamVoiceChannelID)

module.exports = router;