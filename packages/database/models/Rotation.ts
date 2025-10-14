import mongoose, { Schema, Document } from 'mongoose';

export interface IRotationCycle extends Document {
  _id: string;
  chamaId: mongoose.Types.ObjectId;
  cycleNumber: number;
  startDate: Date;
  endDate: Date;
  contributionAmount: number;
  status: 'active' | 'completed' | 'cancelled';
  rotationOrder: mongoose.Types.ObjectId[]; // Array of userIds in rotation order
  currentRecipientIndex: number;
  totalContributions: number;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRotationDistribution extends Document {
  _id: string;
  rotationCycleId: mongoose.Types.ObjectId;
  chamaId: mongoose.Types.ObjectId;
  recipientId: mongoose.Types.ObjectId;
  amount: number;
  scheduledDate: Date;
  distributionDate?: Date;
  status: 'pending' | 'distributed' | 'skipped';
  position: number; // Position in rotation order
  contributions: {
    userId: mongoose.Types.ObjectId;
    amount: number;
    paymentDate: Date;
    paymentMethod: 'mpesa' | 'cash' | 'bank';
    transactionRef?: string;
  }[];
  notes?: string;
  distributedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const RotationCycleSchema = new Schema<IRotationCycle>(
  {
    chamaId: {
      type: Schema.Types.ObjectId,
      ref: 'Chama',
      required: true,
    },
    cycleNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    contributionAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active',
    },
    rotationOrder: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    currentRecipientIndex: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalContributions: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const RotationDistributionSchema = new Schema<IRotationDistribution>(
  {
    rotationCycleId: {
      type: Schema.Types.ObjectId,
      ref: 'RotationCycle',
      required: true,
    },
    chamaId: {
      type: Schema.Types.ObjectId,
      ref: 'Chama',
      required: true,
    },
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
    distributionDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['pending', 'distributed', 'skipped'],
      default: 'pending',
    },
    position: {
      type: Number,
      required: true,
      min: 1,
    },
    contributions: [{
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      amount: {
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
      transactionRef: String,
    }],
    notes: String,
    distributedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
RotationCycleSchema.index({ chamaId: 1, cycleNumber: 1 });
RotationCycleSchema.index({ status: 1 });

RotationDistributionSchema.index({ rotationCycleId: 1, position: 1 });
RotationDistributionSchema.index({ chamaId: 1, status: 1 });
RotationDistributionSchema.index({ recipientId: 1 });

export const RotationCycle = mongoose.models.RotationCycle ||
  mongoose.model<IRotationCycle>('RotationCycle', RotationCycleSchema);

export const RotationDistribution = mongoose.models.RotationDistribution ||
  mongoose.model<IRotationDistribution>('RotationDistribution', RotationDistributionSchema);
