"use strict";

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Import routes
const eventRoutes = require('./routes/events');
const taskRoutes = require('./routes/tasks');

// Import configuration
const config = require('./config/production');

// Create Express app
const app = express();

// Create logs directory if it doesn't exist
const logsDir = path.dirname(config.logging.filePath);
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, {
    recursive: true
  });
}

// Configure Winston logger
const logger = winston.createLogger({
  level: config.logging.level,
  format: winston.format.combine(winston.format.timestamp(), winston.format.errors({
    stack: true
  }), winston.format.json()),
  defaultMeta: {
    service: 'cloudsphere-server'
  },
  transports: [new winston.transports.File({
    filename: config.logging.filePath,
    maxsize: config.logging.maxSize,
    maxFiles: config.logging.maxFiles
  }), new winston.transports.Console({
    format: winston.format.combine(winston.format.colorize(), winston.format.simple())
  })]
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Compression middleware
app.use(compression());

// CORS configuration
app.use(cors({
  origin: config.security.corsOrigin,
  credentials: config.security.corsCredentials,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: config.rateLimit.message,
  standardHeaders: config.rateLimit.standardHeaders,
  legacyHeaders: config.rateLimit.legacyHeaders
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({
  limit: '10mb'
}));
app.use(express.urlencoded({
  extended: true,
  limit: '10mb'
}));

// Logging middleware
app.use(morgan('combined', {
  stream: {
    write: message => logger.info(message.trim())
  }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.APP_VERSION || '1.0.0'
  });
});

// API routes
app.use('/api/events', eventRoutes);
app.use('/api/tasks', taskRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../public')));

  // Handle client-side routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    error: {
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
      ...(process.env.NODE_ENV !== 'production' && {
        stack: err.stack
      })
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// MongoDB connection with retry logic
const connectWithRetry = async () => {
  try {
    await mongoose.connect(config.database.uri, config.database.options);
    logger.info('Connected to MongoDB successfully');
    logger.info(`Database: ${mongoose.connection.name}`);
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    logger.info('Retrying connection in 5 seconds...');
    setTimeout(connectWithRetry, 5000);
  }
};

// Graceful shutdown
const gracefulShutdown = signal => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  mongoose.connection.close(false, () => {
    logger.info('MongoDB connection closed.');
    process.exit(0);
  });
};

// Handle process signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', err => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start server
const server = app.listen(config.server.port, config.server.host, () => {
  logger.info(`Server is running on ${config.server.host}:${config.server.port}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);

  // Connect to MongoDB
  connectWithRetry();
});

// Server timeout configuration
server.timeout = 30000; // 30 seconds
server.keepAliveTimeout = 65000; // 65 seconds
server.headersTimeout = 66000; // 66 seconds

module.exports = app;