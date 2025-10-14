import mongoose, { Schema, Document } from 'mongoose';

export interface IMeetingAttendance {
  userId: mongoose.Types.ObjectId;
  status: 'present' | 'absent' | 'late';
  checkInTime?: Date;
  fineApplied?: number;
}

export interface IMeeting extends Document {
  _id: string;
  chamaId: mongoose.Types.ObjectId;
  title: string;
  meetingType: 'regular' | 'emergency' | 'agm' | 'special';
  scheduledDate: Date;
  scheduledTime: string;
  location?: string;
  agenda?: string;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  attendance: IMeetingAttendance[];
  minutes?: string;
  decisions?: string[];
  nextMeetingDate?: Date;
  createdBy: mongoose.Types.ObjectId;
  completedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MeetingAttendanceSchema = new Schema<IMeetingAttendance>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late'],
    default: 'absent',
  },
  checkInTime: {
    type: Date,
  },
  fineApplied: {
    type: Number,
    default: 0,
  },
}, { _id: false });

const MeetingSchema = new Schema<IMeeting>(
  {
    chamaId: {
      type: Schema.Types.ObjectId,
      ref: 'Chama',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    meetingType: {
      type: String,
      enum: ['regular', 'emergency', 'agm', 'special'],
      default: 'regular',
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
    scheduledTime: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      trim: true,
    },
    agenda: {
      type: String,
    },
    status: {
      type: String,
      enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    attendance: [MeetingAttendanceSchema],
    minutes: {
      type: String,
    },
    decisions: [{
      type: String,
    }],
    nextMeetingDate: {
      type: Date,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    completedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
MeetingSchema.index({ chamaId: 1, scheduledDate: 1 });
MeetingSchema.index({ status: 1 });

export default mongoose.models.Meeting || mongoose.model<IMeeting>('Meeting', MeetingSchema);
