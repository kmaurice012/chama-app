import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB, Meeting, User, Fine, Chama } from '@chama-app/database';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user || !user.chamaId || user.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can update attendance' }, { status: 403 });
    }

    const body = await req.json();
    const { attendance } = body; // Array of { userId, status, checkInTime }

    const meeting = await Meeting.findById(await params.then(p => p.id));
    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    // Get chama settings
    const chama = await Chama.findById(user.chamaId);
    if (!chama) {
      return NextResponse.json({ error: 'Chama not found' }, { status: 404 });
    }

    // Update attendance and apply fines
    for (const att of attendance) {
      const memberIndex = meeting.attendance.findIndex(
        (a: any) => a.userId.toString() === att.userId
      );

      if (memberIndex !== -1) {
        meeting.attendance[memberIndex].status = att.status;
        meeting.attendance[memberIndex].checkInTime = att.checkInTime;

        // Apply fines based on attendance status
        if (att.status === 'absent' && chama.missedMeetingFine > 0) {
          // Create fine for missed meeting
          await Fine.create({
            chamaId: user.chamaId,
            userId: att.userId,
            fineType: 'missed_meeting',
            amount: chama.missedMeetingFine,
            reason: `Missed meeting: ${meeting.title}`,
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            relatedRecordId: meeting._id,
            relatedRecordType: 'meeting',
            issuedBy: user._id,
          });
          meeting.attendance[memberIndex].fineApplied = chama.missedMeetingFine;
        } else if (att.status === 'late' && chama.lateArrivalFine > 0) {
          // Create fine for late arrival
          await Fine.create({
            chamaId: user.chamaId,
            userId: att.userId,
            fineType: 'late_arrival',
            amount: chama.lateArrivalFine,
            reason: `Late arrival to meeting: ${meeting.title}`,
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            relatedRecordId: meeting._id,
            relatedRecordType: 'meeting',
            issuedBy: user._id,
          });
          meeting.attendance[memberIndex].fineApplied = chama.lateArrivalFine;
        }
      }
    }

    await meeting.save();

    const populatedMeeting = await Meeting.findById(meeting._id)
      .populate('attendance.userId', 'name email phone');

    return NextResponse.json({
      message: 'Attendance updated successfully',
      meeting: populatedMeeting,
    });
  } catch (error: any) {
    console.error('Error updating attendance:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
