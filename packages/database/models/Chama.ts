import mongoose, { Schema, Document } from 'mongoose';

export interface IChama extends Document {
  _id: string;
  name: string;
  description?: string;
  registrationNumber?: string;
  chamaType: 'merry-go-round' | 'table-banking' | 'investment' | 'hybrid';
  contributionAmount: number;
  contributionFrequency: 'weekly' | 'monthly';
  meetingDay?: string;
  maxLoanMultiplier: number;
  loanInterestRate: number;
  latePaymentFee: number;
  totalMembers: number;
  totalSavings: number;
  totalLoans: number;
  totalWelfareFund: number;
  isActive: boolean;
  // Rotation settings
  enableRotation: boolean;
  rotationInterval: 'weekly' | 'monthly';
  // Welfare settings
  enableWelfare: boolean;
  welfareContributionAmount?: number;
  // Fine settings
  missedMeetingFine: number;
  lateArrivalFine: number;
  lateContributionFine: number;
  // Guarantor settings
  requireLoanGuarantors: boolean;
  minimumGuarantors: number;
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
    chamaType: {
      type: String,
      enum: ['merry-go-round', 'table-banking', 'investment', 'hybrid'],
      default: 'hybrid',
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
    totalWelfareFund: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Rotation settings
    enableRotation: {
      type: Boolean,
      default: false,
    },
    rotationInterval: {
      type: String,
      enum: ['weekly', 'monthly'],
      default: 'monthly',
    },
    // Welfare settings
    enableWelfare: {
      type: Boolean,
      default: false,
    },
    welfareContributionAmount: {
      type: Number,
      min: 0,
    },
    // Fine settings
    missedMeetingFine: {
      type: Number,
      default: 200,
      min: 0,
    },
    lateArrivalFine: {
      type: Number,
      default: 50,
      min: 0,
    },
    lateContributionFine: {
      type: Number,
      default: 100,
      min: 0,
    },
    // Guarantor settings
    requireLoanGuarantors: {
      type: Boolean,
      default: true,
    },
    minimumGuarantors: {
      type: Number,
      default: 2,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Chama || mongoose.model<IChama>('Chama', ChamaSchema);
