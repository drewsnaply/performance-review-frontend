const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Determine port with fallback and flexibility
const PORT = parseInt(process.env.PORT, 10) || 5001;

// Comprehensive CORS Configuration
const corsOptions = {
  origin: function(origin, callback) {
    // List of allowed origins with more robust configuration
    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'https://performance-review-frontend.onrender.com'
    ];

    // Allow requests with no origin or from allowed origins
    if (!origin || allowedOrigins.some(allowed => 
      origin.startsWith(allowed) || origin === allowed)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error(`CORS not allowed for origin: ${origin}`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'Origin', 
    'X-Requested-With', 
    'Accept',
    'x-client-key', 
    'x-client-token', 
    'x-client-secret', 
    'Cache-Control'
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  preflightContinue: false
};

// Security and logging middleware
app.use(helmet()); // Adds various HTTP headers for security
app.use(morgan('combined')); // Logging requests

// Apply CORS middleware
app.use(cors(corsOptions));

// Detailed request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Incoming Request: {
    method: ${req.method},
    path: ${req.path},
    origin: ${req.get('origin') || 'unknown'},
    user-agent: ${req.get('user-agent') || 'unknown'}
  }`);
  next();
});

// JSON and URL-encoded parsing middleware
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Import routes
const { router: authRoutes } = require('./routes/auth');

// Connect to MongoDB with enhanced error handling
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      // Removed deprecated options
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });
    console.log(`[${new Date().toISOString()}] MongoDB Connection Successful`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] MongoDB Connection Failed:`, {
      message: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/departments', require('./routes/departments'));
app.use('/api/employees', require('./routes/employees'));

// Root route with version info
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Performance Review System Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// CORS and connectivity test endpoint
app.get('/test-cors', (req, res) => {
  res.status(200).json({
    message: 'CORS test successful',
    origin: req.headers.origin || 'unknown',
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((err, req, res, next) => {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] Unhandled Error:`, {
    message: err.message,
    stack: err.stack,
    method: req.method,
    path: req.path
  });

  res.status(err.status || 500).json({
    status: 'error',
    timestamp,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Cannot ${req.method} ${req.path}`,
    timestamp: new Date().toISOString()
  });
});

// Start server
const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`[${new Date().toISOString()}] Server Running: {
        port: ${PORT},
        environment: ${process.env.NODE_ENV || 'development'}
      }`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down gracefully');
      server.close(() => {
        console.log('Process terminated');
        process.exit(0);
      });
    });

    server.on('error', (error) => {
      console.error('Server Startup Error:', error);
      process.exit(1);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;