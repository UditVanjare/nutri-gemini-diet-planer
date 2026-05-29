const mongoose = require('mongoose');

const ProgressLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  weight: {
    type: Number, // in kg, optional if logging water only
  },
  waterIntake: {
    type: Number, // total ml logged for the day
    default: 0
  },
  date: {
    type: String, // format: YYYY-MM-DD
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure a user only has one progress log per date
ProgressLogSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('ProgressLog', ProgressLogSchema);
