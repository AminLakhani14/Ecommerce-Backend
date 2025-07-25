import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

const protect = async (req, res, next) => {
  let token = req.cookies.jwt;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.userId).select('-password');
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const admin = (req, res, next) => {
  const providedKey = req.headers.authorization;
  if (providedKey && providedKey === process.env.ADMIN_SECRET_KEY) {
    req.user = { _id: 'ADMIN_USER_ID_PLACEHOLDER', isAdmin: true };
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as an admin.' });
  }
};

export { protect, admin };