import mongoose, { Schema, Document } from 'mongoose';

export interface IFine extends Document {
  _id: string;
  chamaId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  fineType: 'late_contribution' | 'missed_meeting' | 'late_arrival' | 'loan_default' | 'other';
  amount: number;
  reason: string;
  dueDate: Date;
  status: 'pending' | 'paid' | 'waived';
  paymentDate?: Date;
  paymentMethod?: 'mpesa' | 'cash' | 'bank';
  transactionRef?: string;
  waivedBy?: mongoose.Types.ObjectId;
  waiverReason?: string;
  relatedRecordId?: mongoose.Types.ObjectId; // Link to meeting, contribution, or loan
  relatedRecordType?: 'meeting' | 'contribution' | 'loan';
  issuedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const FineSchema = new Schema<IFine>(
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
    fineType: {
      type: String,
      enum: ['late_contribution', 'missed_meeting', 'late_arrival', 'loan_default', 'other'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    reason: {
      type: String,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'waived'],
      default: 'pending',
    },
    paymentDate: {
      type: Date,
    },
    paymentMethod: {
      type: String,
      enum: ['mpesa', 'cash', 'bank'],
    },
    transactionRef: {
      type: String,
    },
    waivedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    waiverReason: {
      type: String,
    },
    relatedRecordId: {
      type: Schema.Types.ObjectId,
    },
    relatedRecordType: {
      type: String,
      enum: ['meeting', 'contribution', 'loan'],
    },
    issuedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
FineSchema.index({ chamaId: 1, userId: 1 });
FineSchema.index({ status: 1 });
FineSchema.index({ dueDate: 1 });

export default mongoose.models.Fine || mongoose.model<IFine>('Fine', FineSchema);
