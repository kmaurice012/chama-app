import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB, Fine, User, Chama } from '@/packages/database';

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
    const userId = searchParams.get('userId');

    const filter: any = { chamaId: user.chamaId };

    if (status) {
      filter.status = status;
    }

    // Members can only see their own fines
    if (user.role === 'member') {
      filter.userId = user._id;
    } else if (userId) {
      filter.userId = userId;
    }

    const fines = await Fine.find(filter)
      .populate('userId', 'name email phone')
      .populate('issuedBy', 'name')
      .populate('waivedBy', 'name')
      .sort({ createdAt: -1 });

    const totalPending = await Fine.aggregate([
      { $match: { chamaId: user.chamaId, status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const totalPaid = await Fine.aggregate([
      { $match: { chamaId: user.chamaId, status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    return NextResponse.json({
      fines,
      summary: {
        totalPending: totalPending[0]?.total || 0,
        totalPaid: totalPaid[0]?.total || 0,
      },
    });
  } catch (error: any) {
    console.error('Error fetching fines:', error);
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
      return NextResponse.json({ error: 'Only admins can issue fines' }, { status: 403 });
    }

    const body = await req.json();
    const { userId, fineType, amount, reason, dueDate } = body;

    const fine = await Fine.create({
      chamaId: user.chamaId,
      userId,
      fineType,
      amount,
      reason,
      dueDate,
      issuedBy: user._id,
    });

    const populatedFine = await Fine.findById(fine._id)
      .populate('userId', 'name email phone')
      .populate('issuedBy', 'name');

    return NextResponse.json({
      message: 'Fine issued successfully',
      fine: populatedFine,
    });
  } catch (error: any) {
    console.error('Error issuing fine:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
