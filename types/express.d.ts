import type { Types } from 'mongoose';

declare global {
  namespace Express {
    interface User {
      _id: Types.ObjectId | string;
      name?: string;
      email?: string;
      isAdmin: boolean;
    }
  }
}
export {};
