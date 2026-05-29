const ProgressLog = require('../models/ProgressLog');

const { loadData, saveData } = require('../utils/mockStorage');

// In-memory mock database for fallback
const mockProgressLogs = loadData('progressLogs.json', []);

// @desc    Log weight or increment water intake for today
// @route   POST /api/progress
// @access  Private
const logProgress = async (req, res) => {
  try {
    const { weight, waterIncrement, date } = req.body;
    const userId = req.user.id || req.user._id.toString();

    // Use provided date (YYYY-MM-DD) or fallback to server local date
    const logDate = date || new Date().toISOString().split('T')[0];

    // --- IN-MEMORY DB FALLBACK ---
    if (process.env.USE_MEMORY_DB === 'true') {
      let log = mockProgressLogs.find(l => l.userId === userId && l.date === logDate);

      if (log) {
        if (weight !== undefined && weight !== null) {
          log.weight = parseFloat(weight);
        }
        if (waterIncrement !== undefined && waterIncrement !== null) {
          log.waterIntake = (log.waterIntake || 0) + parseInt(waterIncrement);
        }
      } else {
        log = {
          _id: 'mock_log_' + Math.random().toString(36).substr(2, 9),
          userId,
          date: logDate,
          weight: weight !== undefined && weight !== null ? parseFloat(weight) : undefined,
          waterIntake: waterIncrement !== undefined && waterIncrement !== null ? parseInt(waterIncrement) : 0,
          createdAt: new Date()
        };
        mockProgressLogs.push(log);
      }
      saveData('progressLogs.json', mockProgressLogs);

      return res.status(200).json({ success: true, log });
    }

    // --- MONGOOSE / MONGODB PATH ---
    let log = await ProgressLog.findOne({ userId: req.user._id, date: logDate });

    if (log) {
      if (weight !== undefined && weight !== null) {
        log.weight = parseFloat(weight);
      }
      if (waterIncrement !== undefined && waterIncrement !== null) {
        log.waterIntake = (log.waterIntake || 0) + parseInt(waterIncrement);
      }
      await log.save();
    } else {
      log = new ProgressLog({
        userId: req.user._id,
        date: logDate,
        weight: weight !== undefined && weight !== null ? parseFloat(weight) : undefined,
        waterIntake: waterIncrement !== undefined && waterIncrement !== null ? parseInt(waterIncrement) : 0
      });
      await log.save();
    }

    return res.status(200).json({ success: true, log });
  } catch (error) {
    console.error('Log Progress Error:', error);
    return res.status(500).json({ success: false, message: 'Server error logging progress' });
  }
};

// @desc    Get progress logs for charts
// @route   GET /api/progress
// @access  Private
const getProgressHistory = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id.toString();
    let logs = [];

    // --- IN-MEMORY DB FALLBACK ---
    if (process.env.USE_MEMORY_DB === 'true') {
      logs = mockProgressLogs
        .filter(l => l.userId === userId)
        .sort((a, b) => a.date.localeCompare(b.date));
    } else {
      // --- MONGOOSE / MONGODB PATH ---
      logs = await ProgressLog.find({ userId: req.user._id }).sort({ date: 1 });
    }

    // Calculate stats
    const todayStr = new Date().toISOString().split('T')[0];
    const todayLog = logs.find(l => l.date === todayStr);

    const logsWithWeight = logs.filter(l => l.weight !== undefined && l.weight !== null);
    const latestWeight = logsWithWeight.length > 0 ? logsWithWeight[logsWithWeight.length - 1].weight : null;

    return res.json({
      success: true,
      logs,
      todayWater: todayLog ? todayLog.waterIntake : 0,
      latestWeight
    });
  } catch (error) {
    console.error('Get Progress History Error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving progress history' });
  }
};

module.exports = {
  logProgress,
  getProgressHistory
};
