import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB, RotationCycle, RotationDistribution, User } from '@/packages/database';

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

    const filter: any = { chamaId: user.chamaId };
    if (status) {
      filter.status = status;
    }

    const cycles = await RotationCycle.find(filter)
      .populate('rotationOrder', 'name email phone')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    return NextResponse.json({ cycles });
  } catch (error: any) {
    console.error('Error fetching rotation cycles:', error);
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
      return NextResponse.json({ error: 'Only admins can create rotation cycles' }, { status: 403 });
    }

    const body = await req.json();
    const { contributionAmount, startDate, endDate, rotationOrder } = body;

    // Get the latest cycle number
    const latestCycle = await RotationCycle.findOne({ chamaId: user.chamaId })
      .sort({ cycleNumber: -1 });
    const cycleNumber = latestCycle ? latestCycle.cycleNumber + 1 : 1;

    // Create the rotation cycle
    const cycle = await RotationCycle.create({
      chamaId: user.chamaId,
      cycleNumber,
      startDate,
      endDate,
      contributionAmount,
      rotationOrder,
      createdBy: user._id,
    });

    // Calculate distribution dates based on rotation interval
    const members = await User.find({ _id: { $in: rotationOrder } });
    const distributions = [];
    let currentDate = new Date(startDate);

    for (let i = 0; i < rotationOrder.length; i++) {
      distributions.push({
        rotationCycleId: cycle._id,
        chamaId: user.chamaId,
        recipientId: rotationOrder[i],
        amount: contributionAmount * members.length,
        scheduledDate: new Date(currentDate),
        position: i + 1,
        contributions: [],
      });

      // Add one month to the date for next distribution
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    await RotationDistribution.insertMany(distributions);

    const populatedCycle = await RotationCycle.findById(cycle._id)
      .populate('rotationOrder', 'name email phone')
      .populate('createdBy', 'name');

    return NextResponse.json({
      message: 'Rotation cycle created successfully',
      cycle: populatedCycle,
    });
  } catch (error: any) {
    console.error('Error creating rotation cycle:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
