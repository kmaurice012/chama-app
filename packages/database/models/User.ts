import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'superadmin' | 'admin' | 'member';
  chamaId?: mongoose.Types.ObjectId;
  nationalId?: string;
  dateJoined: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['superadmin', 'admin', 'member'],
      default: 'member',
    },
    chamaId: {
      type: Schema.Types.ObjectId,
      ref: 'Chama',
      required: false,
    },
    nationalId: {
      type: String,
      sparse: true,
    },
    dateJoined: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance optimization
UserSchema.index({ email: 1 });
UserSchema.index({ phone: 1 });
UserSchema.index({ chamaId: 1 });
UserSchema.index({ chamaId: 1, role: 1 }); // Compound index for queries filtering by chama and role
UserSchema.index({ role: 1, isActive: 1 }); // Compound index for active users by role
UserSchema.index({ createdAt: -1 }); // For sorting by join date

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
