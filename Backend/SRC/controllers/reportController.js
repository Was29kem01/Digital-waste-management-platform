const prisma = require('../config/prisma');

// Create a new report
exports.createReport = async (req, res) => {
  try {
    const { latitude, longitude, priority, photoUrl } = req.body;
    const report = await prisma.report.create({
      data: {
        latitude,
        longitude,
        priority: priority || 'NORMAL',
        photoUrl,
        submitterId: req.user.id // assuming auth middleware sets req.user
      }
    });
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all reports (with optional filters)
exports.getReports = async (req, res) => {
  try {
    const { status, branchId } = req.query;
    const where = {};
    if (status) where.status = status;
    if (branchId) where.branchId = parseInt(branchId);
    
    const reports = await prisma.report.findMany({ where });
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update report status (e.g. Verify, Reject, Assign, Collect, Priority)
exports.updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedToId, note, priority } = req.body;
    
    const updateData = {};
    
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (assignedToId !== undefined) updateData.assignedToId = assignedToId;

    const report = await prisma.report.update({
      where: { id: parseInt(id) },
      data: updateData
    });
    
    // Log activity
    await prisma.reportActivityLog.create({
      data: {
        action: `Report updated: ${status || ''} ${priority || ''}`,
        newStatus: status || report.status,
        success: true,
        note,
        reportId: report.id,
        userId: req.user.id
      }
    });
    
    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
