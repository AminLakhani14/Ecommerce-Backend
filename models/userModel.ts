import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

interface UserFields { name: string; email: string; password?: string; googleId?: string; isAdmin: boolean }
interface UserMethods { matchPassword(password: string): Promise<boolean> }
type UserModel = mongoose.Model<UserFields, {}, UserMethods>;
const userSchema = new mongoose.Schema<UserFields, UserModel, UserMethods>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Not required for OAuth users
  googleId: { type: String }, // For Google Sign-in
  isAdmin: { type: Boolean, required: true, default: false },
}, { timestamps: true });

userSchema.methods.matchPassword = async function (enteredPassword: string) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model<UserFields, UserModel>('User', userSchema);
export default User;