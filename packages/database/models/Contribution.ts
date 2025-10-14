import mongoose, { Schema, Document } from 'mongoose';

export interface IContribution extends Document {
  _id: string;
  chamaId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  amount: number;
  month: number;
  year: number;
  paymentDate: Date;
  paymentMethod: 'mpesa' | 'cash' | 'bank';
  transactionRef?: string;
  status: 'paid' | 'pending' | 'late';
  notes?: string;
  recordedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ContributionSchema = new Schema<IContribution>(
  {
    chamaId: {
      type: Schema.Types.ObjectId,
      ref: 'Chama',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: 0,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      enum: ['mpesa', 'cash', 'bank'],
      required: true,
    },
    transactionRef: {
      type: String,
    },
    status: {
      type: String,
      enum: ['paid', 'pending', 'late'],
      default: 'paid',
    },
    notes: {
      type: String,
    },
    recordedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance optimization
ContributionSchema.index({ chamaId: 1, userId: 1, month: 1, year: 1 }); // Unique contribution tracking
ContributionSchema.index({ userId: 1, chamaId: 1, year: -1 }); // Member contributions by year
ContributionSchema.index({ chamaId: 1, status: 1 }); // Filter by status per chama
ContributionSchema.index({ paymentDate: -1 }); // Sort by payment date
ContributionSchema.index({ year: -1, month: -1 }); // Time-based queries

export default mongoose.models.Contribution ||
  mongoose.model<IContribution>('Contribution', ContributionSchema);
