import express from 'express';
import passport from 'passport';
import { authUser, registerUser, logoutUser, authGoogleCallback,getUserProfile, updateUserProfile, } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/logout', logoutUser);

// Google Auth Route
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.route('/profile')
  .get(protect, getUserProfile)   
  .put(protect, updateUserProfile);

  router.get(
  '/auth/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: 'http://localhost:3000/login' }),
  authGoogleCallback
);

export default router;