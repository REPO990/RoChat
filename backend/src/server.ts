import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './config/database';
import { initializeSocket } from './services/socket.service';
import authRoutes from './routes/auth.routes';
import chatRoutes from './routes/chat.routes';
import { logger } from './utils/logger';

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

// Log incoming requests
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/auth', authRoutes);
app.use('/chat', chatRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error', {
    error: err.message,
    path: req.path,
    method: req.method
  });
  res.status(500).json({ error: 'Internal server error' });
});

// Initialize Socket.IO
initializeSocket(io);

// Start server
const startServer = async () => {
  try {
    logger.info('Starting server initialization...');
    
    // Initialize database
    await initDatabase();
    logger.info('Database initialized successfully');

    httpServer.listen(PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${PORT}`);
      logger.info(`🔌 Socket.IO ready`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received. Shutting down gracefully...');
      httpServer.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    });

  } catch (error: any) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();