const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/volunteers', require('./routes/volunteers'));
app.use('/api/ngos', require('./routes/ngos'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/scan-report', require('./routes/scanReport'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Smart Resource Allocation System API',
    version: '1.0.0',
    endpoints: [
      'POST /api/auth/signup',
      'POST /api/auth/login',
      'GET  /api/auth/me',
      'GET  /api/tasks',
      'POST /api/tasks',
      'POST /api/tasks/:id/match',
      'GET  /api/volunteers',
      'GET  /api/ngos',
      'GET  /api/dashboard/stats',
      'GET  /api/notifications'
    ]
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}`);
});
