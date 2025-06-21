import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const server = createServer(app);

// Configure CORS for Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());

// Store waiting users and active rooms
const waitingUsers = new Set();
const activeRooms = new Map();
const userSockets = new Map();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  userSockets.set(socket.id, socket);

  // Handle user joining the waiting queue
  socket.on('find-stranger', () => {
    console.log(`User ${socket.id} is looking for a stranger`);
    
    // Remove from any existing room first
    leaveRoom(socket);
    
    // Check if there's someone waiting
    if (waitingUsers.size > 0) {
      // Get the first waiting user
      const waitingUser = waitingUsers.values().next().value;
      waitingUsers.delete(waitingUser);
      
      // Create a room for both users
      const roomId = uuidv4();
      const waitingSocket = userSockets.get(waitingUser);
      
      if (waitingSocket) {
        socket.join(roomId);
        waitingSocket.join(roomId);
        
        activeRooms.set(roomId, {
          users: [socket.id, waitingUser],
          createdAt: new Date()
        });
        
        // Notify both users that they're matched
        socket.emit('stranger-found', { roomId, partnerId: waitingUser });
        waitingSocket.emit('stranger-found', { roomId, partnerId: socket.id });
        
        console.log(`Room ${roomId} created for users ${socket.id} and ${waitingUser}`);
      }
    } else {
      // Add user to waiting queue
      waitingUsers.add(socket.id);
      socket.emit('waiting-for-stranger');
      console.log(`User ${socket.id} added to waiting queue`);
    }
  });

  // Handle WebRTC signaling
  socket.on('webrtc-offer', (data) => {
    socket.to(data.roomId).emit('webrtc-offer', {
      offer: data.offer,
      from: socket.id
    });
  });

  socket.on('webrtc-answer', (data) => {
    socket.to(data.roomId).emit('webrtc-answer', {
      answer: data.answer,
      from: socket.id
    });
  });

  socket.on('webrtc-ice-candidate', (data) => {
    socket.to(data.roomId).emit('webrtc-ice-candidate', {
      candidate: data.candidate,
      from: socket.id
    });
  });

  // Handle text messages
  socket.on('send-message', (data) => {
    socket.to(data.roomId).emit('receive-message', {
      message: data.message,
      from: socket.id,
      timestamp: new Date().toISOString()
    });
  });

  // Handle next button (disconnect from current stranger)
  socket.on('next-stranger', () => {
    console.log(`User ${socket.id} clicked next`);
    leaveRoom(socket);
    
    // Automatically find a new stranger
    socket.emit('disconnected');
    setTimeout(() => {
      socket.emit('find-stranger');
    }, 1000);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    leaveRoom(socket);
    waitingUsers.delete(socket.id);
    userSockets.delete(socket.id);
  });

  // Helper function to remove user from room
  function leaveRoom(socket) {
    // Find and leave any active room
    for (const [roomId, room] of activeRooms.entries()) {
      if (room.users.includes(socket.id)) {
        const partnerId = room.users.find(id => id !== socket.id);
        const partnerSocket = userSockets.get(partnerId);
        
        // Notify partner that user left
        if (partnerSocket) {
          partnerSocket.emit('stranger-disconnected');
          partnerSocket.leave(roomId);
        }
        
        socket.leave(roomId);
        activeRooms.delete(roomId);
        console.log(`Room ${roomId} destroyed, user ${socket.id} left`);
        break;
      }
    }
  }
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server ready for connections`);
});