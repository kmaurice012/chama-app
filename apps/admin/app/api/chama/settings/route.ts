import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB, Chama } from '@chama-app/database';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.chamaId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const chama = await Chama.findById(session.user.chamaId).select(
      'name contributionAmount contributionFrequency loanInterestRate maxLoanMultiplier'
    );

    if (!chama) {
      return NextResponse.json({ error: 'Chama not found' }, { status: 404 });
    }

    return NextResponse.json({
      name: chama.name,
      contributionAmount: chama.contributionAmount,
      contributionFrequency: chama.contributionFrequency,
      loanInterestRate: chama.loanInterestRate,
      maxLoanMultiplier: chama.maxLoanMultiplier,
    });
  } catch (error) {
    console.error('Error fetching chama settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.chamaId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can update settings
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only chama admins can update settings' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, contributionAmount, contributionFrequency, loanInterestRate, maxLoanMultiplier } = body;

    // Validation
    if (!name || !contributionAmount || !contributionFrequency || loanInterestRate === undefined || !maxLoanMultiplier) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (contributionAmount < 100) {
      return NextResponse.json(
        { error: 'Contribution amount must be at least KES 100' },
        { status: 400 }
      );
    }

    if (loanInterestRate < 0 || loanInterestRate > 100) {
      return NextResponse.json(
        { error: 'Interest rate must be between 0% and 100%' },
        { status: 400 }
      );
    }

    if (maxLoanMultiplier < 1 || maxLoanMultiplier > 10) {
      return NextResponse.json(
        { error: 'Loan multiplier must be between 1 and 10' },
        { status: 400 }
      );
    }

    await connectDB();

    const chama = await Chama.findByIdAndUpdate(
      session.user.chamaId,
      {
        name,
        contributionAmount,
        contributionFrequency,
        loanInterestRate,
        maxLoanMultiplier,
      },
      { new: true }
    );

    if (!chama) {
      return NextResponse.json({ error: 'Chama not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Settings updated successfully',
      chama: {
        name: chama.name,
        contributionAmount: chama.contributionAmount,
        contributionFrequency: chama.contributionFrequency,
        loanInterestRate: chama.loanInterestRate,
        maxLoanMultiplier: chama.maxLoanMultiplier,
      },
    });
  } catch (error) {
    console.error('Error updating chama settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
