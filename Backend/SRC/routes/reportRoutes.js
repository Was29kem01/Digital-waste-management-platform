const express = require('express');
const { getReports, updateReportStatus, createReport } = require('../controllers/reportController');
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');

const router = express.Router();

// Get reports (Station Managers and Admins can view based on branch)
router.get('/', authMiddleware, getReports);

// Update report status & priority (Station Manager: Verify/Reject, Station Admin: Assign, Field Agent: Collect)
router.patch('/:id/status', authMiddleware, updateReportStatus);

// Create report (Client)
router.post('/', authMiddleware, requireRole(['CLIENT']), createReport);

module.exports = router;
