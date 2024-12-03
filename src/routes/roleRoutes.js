const express = require('express')
const router = express.Router();
const { createRoles, assignRoles, deleteRoles } = require('../controllers/roleController')

router.post('/create', createRoles);
router.put('/assign', assignRoles);
router.put('/delete', deleteRoles);

module.exports = router;