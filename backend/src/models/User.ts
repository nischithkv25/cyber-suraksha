import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'CITIZEN' | 'ADMIN' | 'CYBER_OFFICER';
  phone?: string;
  otp?: string;
  otpExpiresAt?: Date;
  isVerified: boolean;
  aadhaar?: string;
  city?: string;
  state?: string;
  secondaryPhone?: string;
  bloodGroup?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['CITIZEN', 'ADMIN', 'CYBER_OFFICER'], default: 'CITIZEN' },
  phone: { type: String },
  otp: { type: String },
  otpExpiresAt: { type: Date },
  isVerified: { type: Boolean, default: false },
  aadhaar: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  secondaryPhone: { type: String, default: '' },
  bloodGroup: { type: String, default: '' },
  address: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
