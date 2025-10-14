import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB, Meeting, User } from '@/packages/database';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user || !user.chamaId) {
      return NextResponse.json({ error: 'User not found or not in a chama' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const upcoming = searchParams.get('upcoming');

    const filter: any = { chamaId: user.chamaId };

    if (status) {
      filter.status = status;
    }

    if (upcoming === 'true') {
      filter.scheduledDate = { $gte: new Date() };
      filter.status = { $in: ['scheduled', 'ongoing'] };
    }

    const meetings = await Meeting.find(filter)
      .populate('createdBy', 'name')
      .populate('completedBy', 'name')
      .populate('attendance.userId', 'name email phone')
      .sort({ scheduledDate: -1 });

    return NextResponse.json({ meetings });
  } catch (error: any) {
    console.error('Error fetching meetings:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user || !user.chamaId || user.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can create meetings' }, { status: 403 });
    }

    const body = await req.json();
    const { title, meetingType, scheduledDate, scheduledTime, location, agenda } = body;

    // Get all chama members to initialize attendance
    const members = await User.find({ chamaId: user.chamaId, isActive: true });
    const attendance = members.map(member => ({
      userId: member._id,
      status: 'absent',
    }));

    const meeting = await Meeting.create({
      chamaId: user.chamaId,
      title,
      meetingType,
      scheduledDate,
      scheduledTime,
      location,
      agenda,
      attendance,
      createdBy: user._id,
    });

    const populatedMeeting = await Meeting.findById(meeting._id)
      .populate('createdBy', 'name')
      .populate('attendance.userId', 'name email phone');

    return NextResponse.json({
      message: 'Meeting created successfully',
      meeting: populatedMeeting,
    });
  } catch (error: any) {
    console.error('Error creating meeting:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
