"use strict";

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const {
  Server
} = require('socket.io');
const eventRoutes = require('./routes/events');
const taskRoutes = require('./routes/tasks');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime()
  });
});

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cloudsphere';
mongoose.connect(MONGODB_URI).then(() => {
  console.log('Connected to MongoDB successfully');
  console.log('Database:', mongoose.connection.name);
}).catch(error => {
  console.error('MongoDB connection error:', error);
  process.exit(1); // Exit if cannot connect to database
});

// Routes
app.use('/api/events', eventRoutes);
app.use('/api/tasks', taskRoutes);
const PORT = process.env.PORT || 3001;

// Create HTTP server and attach Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});
io.on('connection', socket => {
  console.log('Socket connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});