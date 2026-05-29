require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Connect to Database
const dbInitPromise = connectDB();

const app = express();

// Block requests until DB initialization is complete (to ensure process.env.USE_MEMORY_DB is set correctly)
app.use(async (req, res, next) => {
  await dbInitPromise;
  next();
});

// Middleware
app.use(cors({
  origin: '*', // In production, replace with specific frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/diet', require('./routes/diet'));
app.use('/api/progress', require('./routes/progress'));

// Base Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Diet Planner AI Chatbot API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}
