import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import cors from 'cors';
import compression from 'compression';
import { ReadCache } from './utils/readCache.js';
import passportSetup from './config/passport-setup.js';
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';

export function createApp() {
  const app = express();
  app.locals.readCache = new ReadCache();
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
    exposedHeaders: ['X-Cache', 'Server-Timing'],
  }));
  app.set('trust proxy', 1);
  app.use(compression({ threshold: 1024 }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(passport.initialize());
  app.use('/api', (req, res, next) => {
    const apiPath = req.path;
    if (req.path.startsWith('/users') || req.path.startsWith('/orders') || req.path.startsWith('/products/admin') || !['GET', 'HEAD'].includes(req.method)) {
      res.set('Cache-Control', 'private, no-store');
    }
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      res.on('finish', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const cache: ReadCache = app.locals.readCache;
          if (apiPath.startsWith('/products') || apiPath.startsWith('/orders')) cache.invalidate('products:');
          if (apiPath.startsWith('/categories')) cache.invalidate('categories:');
        }
      });
    }
    next();
  });
  app.use('/api/products', productRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/orders', orderRoutes);

  // Source and compiled builds serve the same upload directory, regardless of cwd.
  const moduleDir = path.dirname(fileURLToPath(import.meta.url));
  const projectDir = path.basename(moduleDir) === 'dist' ? path.dirname(moduleDir) : moduleDir;
  app.use('/uploads', express.static(path.join(projectDir, 'backend', 'uploads')));
  app.get('/', (_req, res) => res.send('AG-Store API is running...'));
  return app;
}
