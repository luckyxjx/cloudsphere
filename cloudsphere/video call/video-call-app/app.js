// Server-side code (app.js)
const express = require('express');
const https = require('https');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const fs = require('fs');
const os = require('os');

const app = express();

// SSL certificate options
const options = {
  key: fs.readFileSync(path.join(__dirname, 'certs', 'key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'certs', 'cert.pem'))
};

// Create HTTPS server
const server = https.createServer(options, app);
const io = socketIO(server, {
  cors: {
    origin: '*', // Allow all origins for development
    methods: ['GET', 'POST']
  }
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Route for the home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  // Handle room joining
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    // Notify other users in the room
    socket.to(roomId).emit('user-connected', userId);
    
    // Handle disconnection
    socket.on('disconnect', () => {
      socket.to(roomId).emit('user-disconnected', userId);
      console.log('User disconnected:', socket.id);
    });
  });
  
  // Signaling for WebRTC
  socket.on('offer', (offer, roomId, userId) => {
    socket.to(roomId).emit('offer', offer, userId);
  });
  
  socket.on('answer', (answer, roomId, userId) => {
    socket.to(roomId).emit('answer', answer, userId);
  });
  
  socket.on('ice-candidate', (candidate, roomId, userId) => {
    socket.to(roomId).emit('ice-candidate', candidate, userId);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';  // Listen on all network interfaces

server.listen(PORT, HOST, () => {
  const networkInterfaces = os.networkInterfaces();
  console.log(`HTTPS Server running on port ${PORT}`);
  
  // Log all available IP addresses
  Object.keys(networkInterfaces).forEach((interfaceName) => {
    networkInterfaces[interfaceName].forEach((interface) => {
      if (interface.family === 'IPv4' && !interface.internal) {
        console.log(`Access the app at https://${interface.address}:${PORT}`);
      }
    });
  });
});


