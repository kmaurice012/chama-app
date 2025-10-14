import mongoose, { Schema, Document } from 'mongoose';

export interface IWelfareContribution extends Document {
  _id: string;
  chamaId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  amount: number;
  contributionDate: Date;
  paymentMethod: 'mpesa' | 'cash' | 'bank';
  transactionRef?: string;
  type: 'regular' | 'special' | 'emergency';
  notes?: string;
  recordedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IWelfareRequest extends Document {
  _id: string;
  chamaId: mongoose.Types.ObjectId;
  requesterId: mongoose.Types.ObjectId;
  requestType: 'bereavement' | 'medical' | 'wedding' | 'education' | 'emergency' | 'other';
  title: string;
  description: string;
  requestedAmount: number;
  approvedAmount?: number;
  status: 'pending' | 'approved' | 'rejected' | 'disbursed';
  requestDate: Date;
  approvalDate?: Date;
  disbursementDate?: Date;
  approvedBy?: mongoose.Types.ObjectId;
  disbursedBy?: mongoose.Types.ObjectId;
  rejectionReason?: string;
  supportingDocuments?: string[]; // URLs to uploaded documents
  votes?: {
    userId: mongoose.Types.ObjectId;
    vote: 'approve' | 'reject';
    comment?: string;
    voteDate: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const WelfareContributionSchema = new Schema<IWelfareContribution>(
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
      required: true,
      min: 0,
    },
    contributionDate: {
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
    type: {
      type: String,
      enum: ['regular', 'special', 'emergency'],
      default: 'regular',
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

const WelfareRequestSchema = new Schema<IWelfareRequest>(
  {
    chamaId: {
      type: Schema.Types.ObjectId,
      ref: 'Chama',
      required: true,
    },
    requesterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    requestType: {
      type: String,
      enum: ['bereavement', 'medical', 'wedding', 'education', 'emergency', 'other'],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    requestedAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    approvedAmount: {
      type: Number,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'disbursed'],
      default: 'pending',
    },
    requestDate: {
      type: Date,
      default: Date.now,
    },
    approvalDate: {
      type: Date,
    },
    disbursementDate: {
      type: Date,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    disbursedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    rejectionReason: {
      type: String,
    },
    supportingDocuments: [{
      type: String,
    }],
    votes: [{
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      vote: {
        type: String,
        enum: ['approve', 'reject'],
        required: true,
      },
      comment: String,
      voteDate: {
        type: Date,
        default: Date.now,
      },
    }],
  },
  {
    timestamps: true,
  }
);

// Indexes
WelfareContributionSchema.index({ chamaId: 1, userId: 1 });
WelfareContributionSchema.index({ contributionDate: 1 });

WelfareRequestSchema.index({ chamaId: 1, status: 1 });
WelfareRequestSchema.index({ requesterId: 1 });

export const WelfareContribution = mongoose.models.WelfareContribution ||
  mongoose.model<IWelfareContribution>('WelfareContribution', WelfareContributionSchema);

export const WelfareRequest = mongoose.models.WelfareRequest ||
  mongoose.model<IWelfareRequest>('WelfareRequest', WelfareRequestSchema);
