const express = require('express');
const router = express.Router();
const NGO = require('../models/NGO');
const User = require('../models/User');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/roleCheck');

// @route   GET /api/ngos
// @desc    Get all NGOs
router.get('/', auth, async (req, res) => {
  try {
    const ngos = await NGO.find()
      .populate('adminUser', 'name email')
      .populate('members', 'name email skills');
    res.json(ngos);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/ngos
// @desc    Create a new NGO
router.post('/', auth, requireRole('ngo', 'admin'), async (req, res) => {
  try {
    const { name, description, location, category, website, phone } = req.body;

    // Check if user already has an NGO
    const existing = await NGO.findOne({ adminUser: req.user._id });
    if (existing) {
      return res.status(400).json({ message: 'You already have an NGO' });
    }

    const ngo = new NGO({
      name,
      description,
      location: location || {},
      category: category || 'community',
      adminUser: req.user._id,
      members: [],
      website: website || '',
      phone: phone || ''
    });

    await ngo.save();

    // Update user's ngoId
    await User.findByIdAndUpdate(req.user._id, { ngoId: ngo._id });

    res.status(201).json(ngo);
  } catch (error) {
    console.error('Create NGO error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/ngos/:id
// @desc    Get NGO by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const ngo = await NGO.findById(req.params.id)
      .populate('adminUser', 'name email')
      .populate('members', 'name email skills location rating');

    if (!ngo) {
      return res.status(404).json({ message: 'NGO not found' });
    }

    res.json(ngo);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/ngos/:id/join
// @desc    Volunteer joins an NGO
router.post('/:id/join', auth, requireRole('volunteer'), async (req, res) => {
  try {
    const ngo = await NGO.findById(req.params.id);
    if (!ngo) {
      return res.status(404).json({ message: 'NGO not found' });
    }

    // Check if already a member
    if (ngo.members.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already a member of this NGO' });
    }

    ngo.members.push(req.user._id);
    await ngo.save();

    // Update volunteer's ngoId
    await User.findByIdAndUpdate(req.user._id, { ngoId: ngo._id });

    res.json({ message: 'Successfully joined NGO', ngo });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/ngos/:id
// @desc    Update NGO details
router.put('/:id', auth, requireRole('ngo', 'admin'), async (req, res) => {
  try {
    const ngo = await NGO.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!ngo) {
      return res.status(404).json({ message: 'NGO not found' });
    }
    res.json(ngo);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
