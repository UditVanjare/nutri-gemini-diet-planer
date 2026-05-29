const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/dietplanner', {
      serverSelectionTimeoutMS: 2000
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    process.env.USE_MEMORY_DB = 'false';
  } catch (error) {
    console.warn(`\n⚠️ MongoDB Connection Failed: ${error.message}`);
    console.warn('⚠️ Server will run with IN-MEMORY mock storage fallback! (Data will not persist after server restart)\n');
    process.env.USE_MEMORY_DB = 'true';
  }
};

module.exports = connectDB;
