const express = require('express')
const router = express.Router();
const { createChannels, assignChannels, deleteChannels } = require('../controllers/channelController');

router.post('/create', createChannels);
router.put('/assign', assignChannels);
router.put('/delete', deleteChannels)

module.exports = router;