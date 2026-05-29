const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ['user', 'bot'],
    required: true
  },
  text: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const ChatHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // One active session per user
  },
  messages: [ChatMessageSchema],
  currentStep: {
    type: Number,
    default: 0 // Starts at 0 (bot asking age)
  },
  intakeData: {
    age: Number,
    gender: String,
    height: Number,
    weight: Number,
    targetWeight: Number,
    goal: String,
    activityLevel: String,
    preference: String,
    allergies: String,
    medicalRestrictions: String
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

ChatHistorySchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('ChatHistory', ChatHistorySchema);
