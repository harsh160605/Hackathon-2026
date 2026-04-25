const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const User = require('../models/User');
const NGO = require('../models/NGO');
const auth = require('../middleware/auth');

// @route   GET /api/dashboard/stats
// @desc    Get system-wide statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const [
      totalVolunteers,
      totalNGOs,
      totalTasks,
      openTasks,
      completedTasks,
      criticalTasks
    ] = await Promise.all([
      User.countDocuments({ role: 'volunteer' }),
      NGO.countDocuments(),
      Task.countDocuments(),
      Task.countDocuments({ status: 'open' }),
      Task.countDocuments({ status: 'completed' }),
      Task.countDocuments({ urgency: 'critical', status: { $ne: 'completed' } })
    ]);

    // Get task distribution by urgency
    const urgencyDistribution = await Task.aggregate([
      { $group: { _id: '$urgency', count: { $sum: 1 } } }
    ]);

    // Get task distribution by status
    const statusDistribution = await Task.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Get top skills in demand
    const skillsDemand = await Task.aggregate([
      { $unwind: '$requiredSkills' },
      { $group: { _id: '$requiredSkills', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Recent tasks
    const recentTasks = await Task.find()
      .populate('ngoId', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      overview: {
        totalVolunteers,
        totalNGOs,
        totalTasks,
        openTasks,
        completedTasks,
        criticalTasks
      },
      urgencyDistribution,
      statusDistribution,
      skillsDemand,
      recentTasks
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/dashboard/ngo/:ngoId
// @desc    Get NGO-specific dashboard stats
router.get('/ngo/:ngoId', auth, async (req, res) => {
  try {
    const ngoId = req.params.ngoId;

    const [totalTasks, openTasks, completedTasks, members] = await Promise.all([
      Task.countDocuments({ ngoId }),
      Task.countDocuments({ ngoId, status: 'open' }),
      Task.countDocuments({ ngoId, status: 'completed' }),
      NGO.findById(ngoId).select('members').populate('members', 'name skills rating')
    ]);

    const tasks = await Task.find({ ngoId })
      .populate('assignedVolunteer', 'name skills')
      .sort({ createdAt: -1 });

    res.json({
      totalTasks,
      openTasks,
      completedTasks,
      memberCount: members?.members?.length || 0,
      members: members?.members || [],
      tasks
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
