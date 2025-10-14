import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB, Loan } from '@chama-app/database';

// POST record loan repayment
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { amount, paymentMethod, transactionRef } = body;

    if (!amount || !paymentMethod) {
      return NextResponse.json(
        { error: 'Amount and paymentMethod are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const loan = await Loan.findOne({
      _id: params.id,
      chamaId: session.user.chamaId,
    });

    if (!loan) {
      return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
    }

    if (loan.status !== 'disbursed') {
      return NextResponse.json(
        { error: 'Can only repay disbursed loans' },
        { status: 400 }
      );
    }

    if (amount > loan.balance) {
      return NextResponse.json(
        { error: 'Repayment amount exceeds loan balance' },
        { status: 400 }
      );
    }

    // Add repayment
    loan.repayments.push({
      amount,
      date: new Date(),
      paymentMethod,
      transactionRef,
      recordedBy: session.user.id as any,
    });

    // Update amounts
    loan.amountPaid += amount;
    loan.balance -= amount;

    // Check if fully repaid
    if (loan.balance === 0) {
      loan.status = 'repaid';
    }

    await loan.save();

    return NextResponse.json(
      { message: 'Repayment recorded successfully', loan },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Record repayment error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
