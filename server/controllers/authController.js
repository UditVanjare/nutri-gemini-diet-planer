const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const { loadData, saveData } = require('../utils/mockStorage');

// In-memory mock database for fallback mode
const mockUsers = loadData('users.json', []);

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'super_secret_diet_planner_key_123_abc',
    { expiresIn: '30d' }
  );
};

// Helper to format consistent user responses
const formatUserResponse = (user) => {
  const isMongoose = typeof user.toObject === 'function';
  const u = isMongoose ? user.toObject() : user;
  
  return {
    id: u._id || u.id,
    name: u.name,
    email: u.email,
    age: u.age,
    gender: u.gender,
    height: u.height,
    weight: u.weight,
    targetWeight: u.targetWeight,
    goal: u.goal,
    activityLevel: u.activityLevel,
    preference: u.preference,
    allergies: u.allergies,
    medicalRestrictions: u.medicalRestrictions,
    reminderPreferences: u.reminderPreferences,
    createdAt: u.createdAt
  };
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    // --- IN-MEMORY DB FALLBACK ---
    if (process.env.USE_MEMORY_DB === 'true') {
      const emailLower = email.toLowerCase();
      const userExists = mockUsers.find(u => u.email === emailLower);
      if (userExists) {
        return res.status(400).json({ success: false, message: 'User already exists with this email' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const mockUser = {
        _id: 'mock_user_' + Math.random().toString(36).substr(2, 9),
        name,
        email: emailLower,
        password: hashedPassword,
        reminderPreferences: {
          waterTracker: true,
          mealLogging: true,
          workoutAlarm: false
        },
        createdAt: new Date()
      };

      mockUsers.push(mockUser);
      saveData('users.json', mockUsers);

      return res.status(201).json({
        success: true,
        token: generateToken(mockUser._id),
        user: formatUserResponse(mockUser)
      });
    }

    // --- MONGOOSE / MONGODB PATH ---
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const user = await User.create({ name, email, password });

    if (user) {
      return res.status(201).json({
        success: true,
        token: generateToken(user._id),
        user: formatUserResponse(user)
      });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Register Error:', error);
    return res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // --- IN-MEMORY DB FALLBACK ---
    if (process.env.USE_MEMORY_DB === 'true') {
      const emailLower = email.toLowerCase();
      const user = mockUsers.find(u => u.email === emailLower);
      if (user && (await bcrypt.compare(password, user.password))) {
        return res.json({
          success: true,
          token: generateToken(user._id),
          user: formatUserResponse(user)
        });
      } else {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }
    }

    // --- MONGOOSE / MONGODB PATH ---
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      return res.json({
        success: true,
        token: generateToken(user._id),
        user: formatUserResponse(user)
      });
    } else {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    // --- IN-MEMORY DB FALLBACK ---
    if (process.env.USE_MEMORY_DB === 'true') {
      const user = mockUsers.find(u => u._id === req.user.id);
      if (user) {
        return res.json({ success: true, user: formatUserResponse(user) });
      } else {
        return res.status(404).json({ success: false, message: 'User not found in memory' });
      }
    }

    // --- MONGOOSE / MONGODB PATH ---
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      return res.json({ success: true, user: formatUserResponse(user) });
    } else {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    console.error('Get Profile Error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching profile' });
  }
};

// @desc    Update user profile or reminder settings
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const biometricsFields = [
      'age', 'gender', 'height', 'weight', 'targetWeight', 
      'goal', 'activityLevel', 'preference', 'allergies', 'medicalRestrictions'
    ];

    // --- IN-MEMORY DB FALLBACK ---
    if (process.env.USE_MEMORY_DB === 'true') {
      const user = mockUsers.find(u => u._id === req.user.id);
      if (user) {
        user.name = req.body.name || user.name;
        if (req.body.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(req.body.password, salt);
        }
        if (req.body.reminderPreferences) {
          user.reminderPreferences = {
            ...user.reminderPreferences,
            ...req.body.reminderPreferences
          };
        }
        
        // Update biometrics
        biometricsFields.forEach(field => {
          if (req.body[field] !== undefined) {
            user[field] = req.body[field];
          }
        });

        saveData('users.json', mockUsers);

        return res.json({
          success: true,
          user: formatUserResponse(user)
        });
      } else {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
    }

    // --- MONGOOSE / MONGODB PATH ---
    const user = await User.findById(req.user._id);
    if (user) {
      user.name = req.body.name || user.name;
      if (req.body.password) {
        user.password = req.body.password;
      }
      if (req.body.reminderPreferences) {
        user.reminderPreferences = {
          ...user.reminderPreferences.toObject(),
          ...req.body.reminderPreferences
        };
      }

      // Update biometrics
      biometricsFields.forEach(field => {
        if (req.body[field] !== undefined) {
          user[field] = req.body[field];
        }
      });

      const updatedUser = await user.save();

      return res.json({
        success: true,
        user: formatUserResponse(updatedUser)
      });
    } else {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    console.error('Update Profile Error:', error);
    return res.status(500).json({ success: false, message: 'Server error updating profile' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  mockUsers // exported for token middleware reference if needed
};
