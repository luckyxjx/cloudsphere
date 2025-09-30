require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const eventRoutes = require('./routes/events');
const taskRoutes = require('./routes/tasks');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cloudsphere';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully');
    console.log('Database:', mongoose.connection.name);
  })
  .catch((error) => {
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

// In-memory room registry
const roomIdToUserIds = new Map(); // roomId -> Set<socketId>

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);
  let joinedRoomId = null;

  socket.on('join-room', (roomId) => {
    try {
      if (joinedRoomId) {
        socket.leave(joinedRoomId);
        const prevSet = roomIdToUserIds.get(joinedRoomId);
        if (prevSet) {
          prevSet.delete(socket.id);
          if (prevSet.size === 0) roomIdToUserIds.delete(joinedRoomId);
        }
      }

      joinedRoomId = roomId;
      socket.join(roomId);

      if (!roomIdToUserIds.has(roomId)) roomIdToUserIds.set(roomId, new Set());
      const userSet = roomIdToUserIds.get(roomId);
      userSet.add(socket.id);

      // Notify existing users about the new user
      socket.to(roomId).emit('user-connected', socket.id);

      // Send the current users to the new user (excluding themselves)
      const others = Array.from(userSet).filter((id) => id !== socket.id);
      io.to(socket.id).emit('room-users', others);

      console.log(`Socket ${socket.id} joined room ${roomId}`);
    } catch (err) {
      console.error('join-room error:', err);
    }
  });

  socket.on('offer', ({ target, sdp }) => {
    if (!target || !sdp) return;
    io.to(target).emit('offer', { sdp, from: socket.id });
  });

  socket.on('answer', ({ target, sdp }) => {
    if (!target || !sdp) return;
    io.to(target).emit('answer', { sdp, from: socket.id });
  });

  socket.on('ice-candidate', ({ target, candidate }) => {
    if (!target || !candidate) return;
    io.to(target).emit('ice-candidate', { candidate, from: socket.id });
  });

  socket.on('leave-room', () => {
    if (!joinedRoomId) return;
    const userSet = roomIdToUserIds.get(joinedRoomId);
    if (userSet) {
      userSet.delete(socket.id);
      if (userSet.size === 0) roomIdToUserIds.delete(joinedRoomId);
    }
    socket.to(joinedRoomId).emit('user-disconnected', socket.id);
    socket.leave(joinedRoomId);
    joinedRoomId = null;
  });

  socket.on('disconnect', () => {
    if (joinedRoomId) {
      const userSet = roomIdToUserIds.get(joinedRoomId);
      if (userSet) {
        userSet.delete(socket.id);
        if (userSet.size === 0) roomIdToUserIds.delete(joinedRoomId);
      }
      socket.to(joinedRoomId).emit('user-disconnected', socket.id);
    }
    console.log('Socket disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
