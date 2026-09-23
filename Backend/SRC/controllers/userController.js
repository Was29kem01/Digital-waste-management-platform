const prisma = require('../config/prisma');

exports.getUsersByRole = async (req, res) => {
  try {
    const { role, branchId } = req.query;
    const where = {};
    
    if (role) where.role = role;
    if (branchId) where.branchId = parseInt(branchId);
    
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        branchId: true
      }
    });
    
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
