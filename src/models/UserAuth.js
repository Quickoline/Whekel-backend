import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userAuthSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    fcmToken: { type: String, default: '' },
    profilePhoto: { type: String, default: '' },
    role: { type: String, enum: ['user', 'driver'], default: 'user' }
  },
  { timestamps: true }
);

userAuthSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userAuthSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const UserAuth = mongoose.model('UserAuth', userAuthSchema);
export default UserAuth;
