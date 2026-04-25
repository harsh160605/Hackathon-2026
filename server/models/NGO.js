const mongoose = require('mongoose');

const ngoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'NGO name is required'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  location: {
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 },
    city: { type: String, default: '' }
  },
  category: {
    type: String,
    enum: ['education', 'healthcare', 'disaster-relief', 'environment', 'community', 'other'],
    default: 'community'
  },
  adminUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  website: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('NGO', ngoSchema);
