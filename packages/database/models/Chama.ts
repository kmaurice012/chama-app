import mongoose, { Schema, Document } from 'mongoose';

export interface IChama extends Document {
  _id: string;
  name: string;
  description?: string;
  registrationNumber?: string;
  contributionAmount: number;
  contributionFrequency: 'weekly' | 'monthly';
  meetingDay?: string;
  maxLoanMultiplier: number;
  loanInterestRate: number;
  latePaymentFee: number;
  totalMembers: number;
  totalSavings: number;
  totalLoans: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ChamaSchema = new Schema<IChama>(
  {
    name: {
      type: String,
      required: [true, 'Chama name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    registrationNumber: {
      type: String,
      sparse: true,
      unique: true,
    },
    contributionAmount: {
      type: Number,
      required: [true, 'Contribution amount is required'],
      min: 0,
    },
    contributionFrequency: {
      type: String,
      enum: ['weekly', 'monthly'],
      default: 'monthly',
    },
    meetingDay: {
      type: String,
    },
    maxLoanMultiplier: {
      type: Number,
      default: 3,
      min: 1,
    },
    loanInterestRate: {
      type: Number,
      default: 10,
      min: 0,
      max: 100,
    },
    latePaymentFee: {
      type: Number,
      default: 100,
      min: 0,
    },
    totalMembers: {
      type: Number,
      default: 0,
    },
    totalSavings: {
      type: Number,
      default: 0,
    },
    totalLoans: {
      type: Number,
      default: 0,
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

export default mongoose.models.Chama || mongoose.model<IChama>('Chama', ChamaSchema);
