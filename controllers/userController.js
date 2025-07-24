import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';

// Standard email/password login
const authUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && user.password && (await user.matchPassword(password))) {
    generateToken(res, user._id);
    res.json({ _id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin });
  } else {
    res.status(401).send('Invalid email or password');
  }
};

// Standard email/password registration
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) return res.status(400).send('User already exists');

  const user = await User.create({ name, email, password });
  if (user) {
    generateToken(res, user._id);
    res.status(201).json({ _id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin });
  } else {
    res.status(400).send('Invalid user data');
  }
};

// Logout
const logoutUser = (req, res) => {
  try {
    // Set the 'jwt' cookie to an empty string and set its maxAge to 0 
    // to instruct the browser to delete it immediately.
    res.cookie('jwt', '', {
      httpOnly: true,
      expires: new Date(0),
    });
    
    // Send a success response.
    res.status(200).json({ message: 'Logged out successfully' });

  } catch (error) {
    // If for any reason it fails, log the error and send a server error response.
    console.error('Error during logout:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
};

const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    res.json({ _id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
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
const authGoogleCallback = (req, res) => {
    generateToken(res, req.user._id);
    // Redirect to the frontend homepage after successful login
    res.redirect('http://localhost:3000');
};


export { authUser, registerUser, logoutUser, authGoogleCallback, getUserProfile, updateUserProfile };