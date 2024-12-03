const express = require('express')
const router = express.Router();
const { generateReport, loadDatabase, deleteDatabase } = require('../controllers/databaseController');

router.get('/report/:guildID', generateReport)
router.post('/load', loadDatabase);
router.delete('/delete', deleteDatabase);

module.exports = router;