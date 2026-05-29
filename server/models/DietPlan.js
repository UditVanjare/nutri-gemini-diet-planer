const mongoose = require('mongoose');

const DietPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  gender: {
    type: String,
    required: true
  },
  height: {
    type: Number, // in cm
    required: true
  },
  weight: {
    type: Number, // in kg
    required: true
  },
  targetWeight: {
    type: Number // in kg
  },
  goal: {
    type: String,
    enum: ['Weight Loss', 'Weight Gain', 'Muscle Building', 'Maintenance'],
    required: true
  },
  activityLevel: {
    type: String,
    enum: ['Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active'],
    required: true
  },
  preference: {
    type: String,
    enum: ['Vegetarian', 'Vegan', 'Non-Vegetarian'],
    required: true
  },
  allergies: {
    type: String,
    default: ''
  },
  medicalRestrictions: {
    type: String,
    default: ''
  },
  generatedPlan: {
    calories: { type: Number, required: true },
    protein: { type: Number, required: true }, // in grams
    carbs: { type: Number, required: true },   // in grams
    fat: { type: Number, required: true },     // in grams
    waterIntake: { type: Number, required: true }, // in Liters
    meals: {
      breakfast: { type: String, required: true },
      lunch: { type: String, required: true },
      dinner: { type: String, required: true },
      snack: { type: String, required: true }
    },
    exerciseRecommendations: [String]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('DietPlan', DietPlanSchema);
