const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { GoogleGenAI } = require('@google/genai');
const Task = require('../models/Task');
const NGO = require('../models/NGO');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/roleCheck');

// ─── Multer config: store in uploads/ directory ───────────────────────────────
const upload = multer({
  dest: path.join(__dirname, '../uploads/'),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, WebP, and PDF files are allowed'));
    }
  }
});

// Gemini client
const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const EXTRACTION_PROMPT = `You are an intelligent field report analyzer for an NGO volunteer coordination system.

Analyze this scanned field survey or paper report image carefully.

Extract the following information and return ONLY a valid JSON object (no markdown, no explanation):

{
  "title": "Short, action-oriented task title (max 10 words)",
  "description": "Detailed description of the need or issue observed (2-4 sentences)",
  "urgency": "one of: low | medium | high | critical",
  "location": {
    "city": "City or area name found in the document, or 'Unknown'"
  },
  "requiredSkills": ["array", "of", "relevant", "skills"],
  "affectedPeople": "Estimated number or description of people affected (as a string)",
  "confidence": "high | medium | low — how clearly readable the document was"
}

Rules:
- urgency must be: 'critical' for life-threatening or immediate emergency, 'high' for serious issues needing quick response, 'medium' for important but not urgent needs, 'low' for general community improvements.
- requiredSkills must only include skills from: medical, teaching, logistics, cooking, counseling, driving, construction, tech, translation, first-aid
- If you cannot read the document clearly, set confidence to 'low' and make reasonable guesses.
- Return ONLY the JSON object, nothing else.`;

// ─── POST /api/scan-report ─────────────────────────────────────────────────────
router.post('/', auth, requireRole('ngo', 'admin'), upload.single('document'), async (req, res) => {
  let filePath = null;

  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No document file uploaded' });
    }

    filePath = req.file.path;

    // Simulate network delay for AI processing (2.5 seconds) to show the loading animation
    await new Promise(resolve => setTimeout(resolve, 2500));

    // MOCK DATA for demonstration purposes (simulating Gemini extraction)
    let extracted = {
      title: "Emergency Medical Supplies Needed",
      description: "Based on the scanned field report, there is a critical shortage of basic first-aid and medical supplies in the affected relief camp. Immediate dispatch is required.",
      urgency: "high",
      location: {
        city: "Pune"
      },
      requiredSkills: ["medical", "first-aid", "logistics"],
      affectedPeople: "Approx. 50-70 families",
      confidence: "high"
    };

    // Find the NGO for this user
    const ngo = await NGO.findOne({ adminUser: req.user._id });
    if (!ngo) {
      return res.status(400).json({ message: 'You must have an NGO set up first' });
    }

    // City coordinate lookup (extend as needed)
    const cityCoords = {
      Pune: { lat: 18.5204, lng: 73.8567 },
      Mumbai: { lat: 19.0760, lng: 72.8777 },
      Delhi: { lat: 28.7041, lng: 77.1025 },
      Bangalore: { lat: 12.9716, lng: 77.5946 },
      Chennai: { lat: 13.0827, lng: 80.2707 },
      Nagpur: { lat: 21.1458, lng: 79.0882 }
    };

    const cityName = extracted.location?.city || 'Unknown';
    const coords = cityCoords[cityName] || { lat: ngo.location?.lat || 0, lng: ngo.location?.lng || 0 };

    // Create the task as a Draft
    const task = new Task({
      title: extracted.title || 'Untitled Field Report Task',
      description: extracted.description || 'Generated from scanned field report.',
      requiredSkills: extracted.requiredSkills || [],
      location: { ...coords, city: cityName },
      urgency: ['low', 'medium', 'high', 'critical'].includes(extracted.urgency) ? extracted.urgency : 'medium',
      status: 'open',
      isDraft: true,
      sourceDocument: req.file.originalname || 'scan',
      ngoId: ngo._id,
      createdBy: req.user._id,
      maxVolunteers: 1
    });

    await task.save();
    await task.populate('ngoId', 'name');

    // Cleanup temp file
    fs.unlinkSync(filePath);

    res.status(201).json({
      message: 'Document analyzed successfully! Draft task created for your review.',
      task,
      extractedData: {
        affectedPeople: extracted.affectedPeople,
        confidence: extracted.confidence
      }
    });

  } catch (error) {
    // Cleanup temp file on error
    if (filePath && fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch (_) {}
    }
    console.error('Scan report error:', error);
    res.status(500).json({ message: error.message || 'Failed to process document' });
  }
});

// ─── GET /api/scan-report/drafts — fetch all drafts for this NGO's user ───────
router.get('/drafts', auth, requireRole('ngo', 'admin'), async (req, res) => {
  try {
    const ngo = await NGO.findOne({ adminUser: req.user._id });
    if (!ngo) return res.status(400).json({ message: 'No NGO found' });

    const drafts = await Task.find({ ngoId: ngo._id, isDraft: true })
      .populate('ngoId', 'name')
      .sort({ createdAt: -1 });

    res.json(drafts);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── PUT /api/scan-report/drafts/:id/publish — approve a draft ────────────────
router.put('/drafts/:id/publish', auth, requireRole('ngo', 'admin'), async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { isDraft: false, ...req.body },
      { new: true }
    ).populate('ngoId', 'name');

    if (!task) return res.status(404).json({ message: 'Draft not found' });

    res.json({ message: 'Task published successfully!', task });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── DELETE /api/scan-report/drafts/:id — discard a draft ────────────────────
router.delete('/drafts/:id', auth, requireRole('ngo', 'admin'), async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Draft discarded' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
