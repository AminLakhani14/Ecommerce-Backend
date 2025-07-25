import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

import cookieParser from 'cookie-parser';
import passport from 'passport';
import cors from 'cors';
import connectDB from './config/db.js';
import passportSetup from './config/passport-setup.js';
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

const startServer = async () => {
  try {
    await connectDB();
    
    const app = express();
    passportSetup(passport);

    // --- START: THE FINAL, GUARANTEED FIX for CORS ---
    
    // 1. Define all the frontend URLs that our backend should trust.
    const allowedOrigins = [
      'http://localhost:3000',                 // For local development
      'https://agclothingstore.netlify.app'    // For your deployed site
    ];

    // 2. Configure CORS with a function that checks the whitelist.
    app.use(cors({
      origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
          const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
          return callback(new Error(msg), false);
        }
        return callback(null, true);
      },
      credentials: true, // This is still needed for the user login cookie
    }));
    
    // --- END: THE FINAL, GUARANTEED FIX for CORS ---

    app.set('trust proxy', 1); // Still important for deployment

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());
    app.use(passport.initialize());

    // API Routes
    app.use('/api/products', productRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/orders', orderRoutes);

    const __dirname = path.resolve();
    app.use('/uploads', express.static(path.join(__dirname, '/backend/uploads')));
    
    app.get('/', (req, res) => {
      res.send('AG-Store API is running...');
    });
    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();