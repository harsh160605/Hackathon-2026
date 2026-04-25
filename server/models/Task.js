const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Task description is required']
  },
  requiredSkills: {
    type: [String],
    default: []
  },
  location: {
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 },
    city: { type: String, default: '' }
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'assigned', 'in-progress', 'completed', 'cancelled'],
    default: 'open'
  },
  ngoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NGO',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedVolunteer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  maxVolunteers: {
    type: Number,
    default: 1
  },
  deadline: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  feedback: {
    rating: { type: Number, default: 0 },
    comment: { type: String, default: '' }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Task', taskSchema);
