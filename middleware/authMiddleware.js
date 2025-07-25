import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

const protect = async (req, res, next) => {
  let token = req.cookies.jwt;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.userId).select('-password');
      
      if (req.user) {
        return next();
      }
    } catch (error) {
      console.error('Token verification failed:', error.message);
    }
  }
  
  res.status(401).json({ message: 'Not authorized, no token' });
};

const admin = async (req, res, next) => {
  const providedKey = req.headers.authorization;

  if (providedKey && providedKey === process.env.ADMIN_SECRET_KEY) {
    try {
      const adminUser = await User.findById(process.env.ADMIN_USER_ID).select('-password');
      if (adminUser && adminUser.isAdmin) {
        req.user = adminUser; 
        return next();
      }
    } catch (error) {
        console.error('Error finding admin user:', error);
        return res.status(500).json({ message: 'Server error during admin verification.' });
    }
  }
  
  res.status(401).json({ message: 'Not authorized as an admin' });
};

export { protect, admin };