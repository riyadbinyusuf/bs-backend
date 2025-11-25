import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { env } from './utils/env';
import { logger } from './utils/logger';
import routes from './routes';
import path from 'path';
import { fileURLToPath } from 'url';

// import './utils/redis';
// import './config/nodemailer' // add email and password in .env file and uncomment this line;

const app = express();
const PORT = env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(helmet());
app.use(cors({
  origin: env.CLIENT_URL || 'http://localhost:4000',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(cookieParser());

// Health check route
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Server is running!',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/v1', routes);

// Global error handler
interface CustomError extends Error {
  status?: number;
}
app.use((err: CustomError, req: Request, res: Response, next: NextFunction) => {
  logger.error('Global error:', err);
  res.status(err?.status || 500).json({
    status: 'error',
    message: 'Internal server error'
  });
});

app.listen(PORT, () => {
  logger.success(`🚀 Server running on port ${PORT}`);
  logger.info(`Environment: ${env.NODE_ENV || 'development'}`);
});

export default app;
