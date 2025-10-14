import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB, Contribution, Chama } from '@chama-app/database';

// GET contributions
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    await connectDB();

    const query: any = { chamaId: session.user.chamaId };

    // Members can only see their own contributions
    if (session.user.role === 'member') {
      query.userId = session.user.id;
    } else if (userId) {
      // Admins can filter by userId
      query.userId = userId;
    }

    if (month) query.month = parseInt(month);
    if (year) query.year = parseInt(year);

    const contributions = await Contribution.find(query)
      .populate('userId', 'name email phone')
      .populate('recordedBy', 'name')
      .sort({ paymentDate: -1 });

    return NextResponse.json({ contributions }, { status: 200 });
  } catch (error: any) {
    console.error('Get contributions error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST create contribution
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, amount, month, year, paymentMethod, transactionRef, notes } = body;

    if (!userId || !amount || !month || !year || !paymentMethod) {
      return NextResponse.json(
        { error: 'UserId, amount, month, year, and paymentMethod are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if contribution already exists for this month
    const existingContribution = await Contribution.findOne({
      chamaId: session.user.chamaId,
      userId,
      month,
      year,
    });

    if (existingContribution) {
      return NextResponse.json(
        { error: 'Contribution for this month already exists' },
        { status: 400 }
      );
    }

    // Create contribution
    const contribution = await Contribution.create({
      chamaId: session.user.chamaId,
      userId,
      amount,
      month,
      year,
      paymentMethod,
      transactionRef,
      notes,
      status: 'paid',
      recordedBy: session.user.id,
    });

    // Update chama total savings
    await Chama.findByIdAndUpdate(session.user.chamaId, {
      $inc: { totalSavings: amount },
    });

    return NextResponse.json(
      { message: 'Contribution recorded successfully', contribution },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create contribution error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
