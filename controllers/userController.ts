import type { RequestHandler } from 'express';
import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';

// Standard email/password login
const authUser: RequestHandler<Record<string, string>> = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('_id name email isAdmin password');

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin, // This was the missing piece.
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};

const registerUser: RequestHandler<Record<string, string>> = async (req, res) => {
  const { name, email, password } = req.body;
  const userExists = await User.exists({ email });
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }
  const user = await User.create({ name, email, password });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

// Logout
const logoutUser: RequestHandler<Record<string, string>> = (req, res) => {
  res.status(200).json({ message: 'Logout successful' });
};


const getUserProfile: RequestHandler<Record<string, string>> = async (req, res) => {
  const user = await User.findById(req.user!._id).select('_id name email isAdmin').lean();
  if (user) {
    res.json({ _id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

const updateUserProfile: RequestHandler<Record<string, string>> = async (req, res) => {
  const user = await User.findById(req.user!._id);
  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.password) {
      user.password = req.body.password;
    }
    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// Google Auth Callback Controller
const authGoogleCallback: RequestHandler<Record<string, string>> = (req, res) => {
    const token = generateToken(req.user!._id);
    res.cookie('jwt', token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
    // Redirect to the frontend homepage after successful login
    res.redirect(process.env.FRONTEND_URL || 'http://localhost:3000');
};


export { authUser, registerUser, logoutUser, authGoogleCallback, getUserProfile, updateUserProfile };
