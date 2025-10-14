import mongoose, { Schema, Document } from 'mongoose';

export interface ILoanRepayment {
  amount: number;
  date: Date;
  paymentMethod: 'mpesa' | 'cash' | 'bank';
  transactionRef?: string;
  recordedBy: mongoose.Types.ObjectId;
}

export interface IGuarantor {
  userId: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'rejected';
  responseDate?: Date;
  rejectionReason?: string;
}

export interface ILoan extends Document {
  _id: string;
  chamaId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  amount: number;
  interestRate: number;
  totalAmount: number;
  purpose: string;
  requestDate: Date;
  approvalDate?: Date;
  disbursementDate?: Date;
  dueDate: Date;
  status: 'pending' | 'approved' | 'rejected' | 'disbursed' | 'repaid' | 'defaulted';
  approvedBy?: mongoose.Types.ObjectId;
  repayments: ILoanRepayment[];
  amountPaid: number;
  balance: number;
  guarantors: IGuarantor[];
  requiresGuarantors: boolean;
  minimumGuarantors: number;
  notes?: string;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const GuarantorSchema = new Schema<IGuarantor>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },
  responseDate: {
    type: Date,
  },
  rejectionReason: {
    type: String,
  },
}, { _id: false });

const LoanRepaymentSchema = new Schema<ILoanRepayment>({
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  date: {
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
  recordedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

const LoanSchema = new Schema<ILoan>(
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
      required: [true, 'Loan amount is required'],
      min: 0,
    },
    interestRate: {
      type: Number,
      required: true,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    purpose: {
      type: String,
      required: [true, 'Loan purpose is required'],
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
    dueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'disbursed', 'repaid', 'defaulted'],
      default: 'pending',
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    repayments: [LoanRepaymentSchema],
    amountPaid: {
      type: Number,
      default: 0,
    },
    balance: {
      type: Number,
      required: true,
    },
    guarantors: [GuarantorSchema],
    requiresGuarantors: {
      type: Boolean,
      default: true,
    },
    minimumGuarantors: {
      type: Number,
      default: 2,
      min: 0,
    },
    notes: {
      type: String,
    },
    rejectionReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance optimization
LoanSchema.index({ chamaId: 1, userId: 1 }); // User's loans in chama
LoanSchema.index({ chamaId: 1, status: 1 }); // Filter loans by status per chama
LoanSchema.index({ userId: 1, status: 1 }); // User's loans by status
LoanSchema.index({ 'guarantors.userId': 1, 'guarantors.status': 1 }); // Guarantor queries
LoanSchema.index({ requestDate: -1 }); // Sort by request date
LoanSchema.index({ dueDate: 1, status: 1 }); // Overdue loans query

export default mongoose.models.Loan || mongoose.model<ILoan>('Loan', LoanSchema);
