import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/authRoutes';
import aiRoutes from './routes/aiRoutes';
import emergencyRoutes from './routes/emergencyRoutes';
import { initializeSocketService } from './services/socketService';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = initializeSocketService(httpServer);

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/emergency', emergencyRoutes);

// Socket.io for mock real-time threat streams
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Emit mock threat data every 10 seconds
  const interval = setInterval(() => {
    socket.emit('threat-alert', {
      type: 'PHISHING_ATTACK',
      severity: 'HIGH',
      location: 'Karnataka',
      timestamp: new Date()
    });
  }, 10000);

  socket.on('disconnect', () => {
    clearInterval(interval);
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cybersuraksha';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
// Trigger nodemon restart 7
