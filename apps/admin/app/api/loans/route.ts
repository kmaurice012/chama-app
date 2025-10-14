import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB, Loan, Chama, Contribution } from '@chama-app/database';

// GET loans
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');

    await connectDB();

    const query: any = { chamaId: session.user.chamaId };
    if (status) query.status = status;
    if (userId) query.userId = userId;

    const loans = await Loan.find(query)
      .populate('userId', 'name email phone')
      .populate('approvedBy', 'name')
      .sort({ requestDate: -1 });

    return NextResponse.json({ loans }, { status: 200 });
  } catch (error: any) {
    console.error('Get loans error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST create loan request
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, amount, purpose, dueDate } = body;

    if (!userId || !amount || !purpose || !dueDate) {
      return NextResponse.json(
        { error: 'UserId, amount, purpose, and dueDate are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Get chama settings
    const chama = await Chama.findById(session.user.chamaId);
    if (!chama) {
      return NextResponse.json({ error: 'Chama not found' }, { status: 404 });
    }

    // Calculate member's total contributions
    const contributions = await Contribution.aggregate([
      {
        $match: {
          chamaId: session.user.chamaId as any,
          userId: userId as any,
          status: 'paid',
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    const totalContributions = contributions[0]?.total || 0;
    const maxLoanAmount = totalContributions * chama.maxLoanMultiplier;

    // Check if requested amount is within limit
    if (amount > maxLoanAmount) {
      return NextResponse.json(
        {
          error: `Loan amount exceeds maximum allowed (KES ${maxLoanAmount.toLocaleString()})`,
        },
        { status: 400 }
      );
    }

    // Calculate interest
    const interestAmount = (amount * chama.loanInterestRate) / 100;
    const totalAmount = amount + interestAmount;

    // Create loan
    const loan = await Loan.create({
      chamaId: session.user.chamaId,
      userId,
      amount,
      interestRate: chama.loanInterestRate,
      totalAmount,
      purpose,
      dueDate: new Date(dueDate),
      balance: totalAmount,
      status: 'pending',
    });

    return NextResponse.json(
      { message: 'Loan request created successfully', loan },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create loan error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
