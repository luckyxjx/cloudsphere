import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User
