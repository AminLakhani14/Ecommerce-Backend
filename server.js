import path from 'path';
import express from 'express';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import cors from 'cors';
import passportSetup from './config/passport-setup.js';
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import dotenv from 'dotenv';
import connectDB from './config/db.js'
import orderRoutes from './routes/orderRoutes.js'; 

dotenv.config();
connectDB();
passportSetup(passport);

const app = express();

const corsOptions = {
  origin: [
      'http://localhost:3000',
      'https://agclothingstore.netlify.app'
  ],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Passport middleware
app.use(passport.initialize());

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes); 

// Make uploads folder static
const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, '/backend/uploads')));


app.get('/', (req, res) => {
  res.send('AG-Store API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));