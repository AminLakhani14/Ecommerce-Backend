import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import cors from 'cors';
import passportSetup from './config/passport-setup.js';
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

export function createApp() {
  const app = express();
  passportSetup(passport);
  const allowedOrigins = [
    'http://localhost:3000',
    'https://agclothingstore.netlify.app',
    ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
  ];
  app.use(cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'), false);
    },
    credentials: true,
  }));
  app.set('trust proxy', 1);
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(passport.initialize());
  app.use('/api/products', productRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/orders', orderRoutes);

  // Source and compiled builds serve the same upload directory, regardless of cwd.
  const moduleDir = path.dirname(fileURLToPath(import.meta.url));
  const projectDir = path.basename(moduleDir) === 'dist' ? path.dirname(moduleDir) : moduleDir;
  app.use('/uploads', express.static(path.join(projectDir, 'backend', 'uploads')));
  app.get('/', (_req, res) => res.send('AG-Store API is running...'));
  return app;
}
