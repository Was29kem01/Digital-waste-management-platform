const express = require('express');
const { getUsersByRole } = require('../controllers/userController');
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');

const router = express.Router();

// Get users by role (e.g. fetch field agents for a branch)
router.get('/', authMiddleware, getUsersByRole);

module.exports = router;
