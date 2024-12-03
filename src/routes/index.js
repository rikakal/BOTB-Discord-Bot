// list of all routers
const express = require('express')
const router = express.Router();

const databaseRoutes = require('../routes/databaseRoutes')
const roleRoutes = require('../routes/roleRoutes')
const teamRoutes = require('../routes/teamRoutes')
const playerRoutes = require('../routes/playerRoutes')
const channelRoutes = require('../routes/channelRoutes')

router.use('/database', databaseRoutes);
router.use('/role', roleRoutes);
router.use('/team', teamRoutes);
router.use('/player', playerRoutes);
router.use('/channel', channelRoutes)

module.exports = router;