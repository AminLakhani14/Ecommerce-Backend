import type { Types } from 'mongoose';
import jwt from 'jsonwebtoken';

const generateToken = (userId: Types.ObjectId | string) => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is required');
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

export default generateToken;