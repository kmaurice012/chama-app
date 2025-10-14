import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB, WelfareContribution, User, Chama } from '@/packages/database';

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
    const userId = searchParams.get('userId');
    const type = searchParams.get('type');

    const filter: any = { chamaId: user.chamaId };

    if (userId) {
      filter.userId = userId;
    }

    if (type) {
      filter.type = type;
    }

    const contributions = await WelfareContribution.find(filter)
      .populate('userId', 'name email phone')
      .populate('recordedBy', 'name')
      .sort({ contributionDate: -1 });

    const total = await WelfareContribution.aggregate([
      { $match: { chamaId: user.chamaId } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    return NextResponse.json({
      contributions,
      totalWelfareFund: total[0]?.total || 0,
    });
  } catch (error: any) {
    console.error('Error fetching welfare contributions:', error);
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
      return NextResponse.json({ error: 'Only admins can record welfare contributions' }, { status: 403 });
    }

    const body = await req.json();
    const { userId, amount, paymentMethod, transactionRef, type, notes } = body;

    const contribution = await WelfareContribution.create({
      chamaId: user.chamaId,
      userId,
      amount,
      paymentMethod,
      transactionRef,
      type: type || 'regular',
      notes,
      recordedBy: user._id,
    });

    // Update chama welfare fund total
    await Chama.findByIdAndUpdate(user.chamaId, {
      $inc: { totalWelfareFund: amount },
    });

    const populatedContribution = await WelfareContribution.findById(contribution._id)
      .populate('userId', 'name email phone')
      .populate('recordedBy', 'name');

    return NextResponse.json({
      message: 'Welfare contribution recorded successfully',
      contribution: populatedContribution,
    });
  } catch (error: any) {
    console.error('Error recording welfare contribution:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
