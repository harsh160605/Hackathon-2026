const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  role: {
    type: String,
    enum: ['volunteer', 'ngo', 'admin'],
    default: 'volunteer'
  },
  // Volunteer-specific fields
  skills: {
    type: [String],
    default: []
  },
  location: {
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 },
    city: { type: String, default: '' }
  },
  availability: {
    type: String,
    enum: ['full-time', 'part-time', 'weekends', 'not-available'],
    default: 'part-time'
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  assignedTasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }],
  completedTasks: {
    type: Number,
    default: 0
  },
  ngoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NGO',
    default: null
  },
  phone: {
    type: String,
    default: ''
  },
  avatar: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
