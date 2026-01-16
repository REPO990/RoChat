import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './config/database';
import { initializeSocket } from './services/socket.service';
import authRoutes from './routes/auth.routes';
import chatRoutes from './routes/chat.routes';
import { authLimiter, apiLimiter } from './middleware/rateLimiter';
import helmet from 'helmet';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:8080'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/auth', authRoutes);
app.use('/chat', chatRoutes);
app.get('/debug-auth', (req, res) => {
  console.log('Debug route hit!');
  res.send('Auth router is working.');
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize Socket.IO
initializeSocket(io);

// Start server
const startServer = async () => {
  try {
    // Initialize database
    await initDatabase();

    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`🔌 Socket.IO ready`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();