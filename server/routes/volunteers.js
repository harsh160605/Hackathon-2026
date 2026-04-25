const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/roleCheck');

// @route   GET /api/volunteers
// @desc    Get all volunteers (with optional filters)
router.get('/', auth, async (req, res) => {
  try {
    const { skill, city, availability } = req.query;
    const filter = { role: 'volunteer' };

    if (skill) filter.skills = { $in: [skill] };
    if (city) filter['location.city'] = { $regex: city, $options: 'i' };
    if (availability) filter.availability = availability;

    const volunteers = await User.find(filter)
      .select('-password')
      .populate('ngoId', 'name')
      .populate('assignedTasks', 'title status urgency')
      .sort({ rating: -1 });

    res.json(volunteers);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/volunteers/:id
// @desc    Get a volunteer by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const volunteer = await User.findById(req.params.id)
      .select('-password')
      .populate('ngoId', 'name')
      .populate('assignedTasks');

    if (!volunteer || volunteer.role !== 'volunteer') {
      return res.status(404).json({ message: 'Volunteer not found' });
    }

    res.json(volunteer);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/volunteers/:id
// @desc    Update volunteer profile
router.put('/:id', auth, async (req, res) => {
  try {
    // Only allow self or admin to update
    if (req.user._id.toString() !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { name, skills, location, availability, phone } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (skills) updates.skills = skills;
    if (location) updates.location = location;
    if (availability) updates.availability = availability;
    if (phone) updates.phone = phone;

    const volunteer = await User.findByIdAndUpdate(req.params.id, updates, { new: true })
      .select('-password');

    res.json(volunteer);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
