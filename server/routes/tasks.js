const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const User = require('../models/User');
const NGO = require('../models/NGO');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/roleCheck');
const { matchVolunteersToTask } = require('../services/matchingEngine');
const { calculatePriorityScore, sortByPriority } = require('../services/priorityScorer');

// @route   GET /api/tasks
// @desc    Get all tasks (with filters)
router.get('/', auth, async (req, res) => {
  try {
    const { status, urgency, skill, city, sortBy } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (urgency) filter.urgency = urgency;
    if (skill) filter.requiredSkills = { $in: [skill] };
    if (city) filter['location.city'] = { $regex: city, $options: 'i' };

    let tasks = await Task.find(filter)
      .populate('ngoId', 'name')
      .populate('createdBy', 'name')
      .populate('assignedVolunteer', 'name email skills')
      .sort({ createdAt: -1 });

    // Add priority scores
    tasks = tasks.map(task => {
      const taskObj = task.toObject();
      taskObj.priorityScore = calculatePriorityScore(task);
      return taskObj;
    });

    // Sort by priority if requested
    if (sortBy === 'priority') {
      tasks.sort((a, b) => b.priorityScore - a.priorityScore);
    }

    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/tasks
// @desc    Create a new task (NGO only)
router.post('/', auth, requireRole('ngo', 'admin'), async (req, res) => {
  try {
    const { title, description, requiredSkills, location, urgency, deadline, maxVolunteers } = req.body;

    // Find user's NGO
    const ngo = await NGO.findOne({ adminUser: req.user._id });
    if (!ngo) {
      return res.status(400).json({ message: 'You must create an NGO first' });
    }

    const task = new Task({
      title,
      description,
      requiredSkills: requiredSkills || [],
      location: location || ngo.location,
      urgency: urgency || 'medium',
      deadline: deadline || null,
      maxVolunteers: maxVolunteers || 1,
      ngoId: ngo._id,
      createdBy: req.user._id
    });

    await task.save();
    await task.populate('ngoId', 'name');

    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/tasks/:id
// @desc    Get task by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('ngoId', 'name location')
      .populate('createdBy', 'name')
      .populate('assignedVolunteer', 'name email skills location rating');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const taskObj = task.toObject();
    taskObj.priorityScore = calculatePriorityScore(task);

    res.json(taskObj);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update a task
router.put('/:id', auth, requireRole('ngo', 'admin'), async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('ngoId', 'name')
      .populate('assignedVolunteer', 'name email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/tasks/:id/match
// @desc    Find best matching volunteers for a task
router.post('/:id/match', auth, requireRole('ngo', 'admin'), async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Get all available volunteers
    const volunteers = await User.find({
      role: 'volunteer',
      availability: { $ne: 'not-available' }
    });

    const matches = matchVolunteersToTask(task, volunteers, 10);

    res.json({
      task: task.title,
      matchCount: matches.length,
      matches: matches.map(m => ({
        volunteerId: m.volunteer._id,
        name: m.volunteer.name,
        email: m.volunteer.email,
        skills: m.volunteer.skills,
        location: m.volunteer.location,
        availability: m.volunteer.availability,
        rating: m.volunteer.rating,
        score: m.score,
        breakdown: m.breakdown
      }))
    });
  } catch (error) {
    console.error('Matching error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/tasks/:id/assign
// @desc    Assign a volunteer to a task
router.post('/:id/assign', auth, requireRole('ngo', 'admin'), async (req, res) => {
  try {
    const { volunteerId } = req.body;
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.assignedVolunteer = volunteerId;
    task.status = 'assigned';
    await task.save();

    // Update volunteer's assigned tasks
    await User.findByIdAndUpdate(volunteerId, {
      $push: { assignedTasks: task._id }
    });

    // Create notification
    await new Notification({
      userId: volunteerId,
      message: `You have been assigned to task: "${task.title}"`,
      type: 'task_assigned',
      relatedTask: task._id
    }).save();

    await task.populate('assignedVolunteer', 'name email skills');
    res.json(task);
  } catch (error) {
    console.error('Assign error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/tasks/:id/complete
// @desc    Mark task as completed
router.put('/:id/complete', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.status = 'completed';
    task.completedAt = new Date();
    if (rating) task.feedback = { rating, comment: comment || '' };
    await task.save();

    // Update volunteer's completed count and rating
    if (task.assignedVolunteer) {
      const volunteer = await User.findById(task.assignedVolunteer);
      if (volunteer && rating) {
        volunteer.completedTasks += 1;
        volunteer.totalRatings += 1;
        volunteer.rating = ((volunteer.rating * (volunteer.totalRatings - 1)) + rating) / volunteer.totalRatings;
        await volunteer.save();
      }

      await new Notification({
        userId: task.assignedVolunteer,
        message: `Task "${task.title}" has been marked as completed!`,
        type: 'task_completed',
        relatedTask: task._id
      }).save();
    }

    res.json(task);
  } catch (error) {
    console.error('Complete error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
