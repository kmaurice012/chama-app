import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB, Loan } from '@chama-app/database';

// GET single loan
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const loan = await Loan.findOne({
      _id: params.id,
      chamaId: session.user.chamaId,
    })
      .populate('userId', 'name email phone')
      .populate('approvedBy', 'name')
      .populate('repayments.recordedBy', 'name');

    if (!loan) {
      return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
    }

    return NextResponse.json({ loan }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH update loan status (approve/reject/disburse)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, notes } = body;

    await connectDB();

    const loan = await Loan.findOne({
      _id: params.id,
      chamaId: session.user.chamaId,
    });

    if (!loan) {
      return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
    }

    let updateData: any = {};

    if (action === 'approve') {
      if (loan.status !== 'pending') {
        return NextResponse.json(
          { error: 'Only pending loans can be approved' },
          { status: 400 }
        );
      }
      updateData = {
        status: 'approved',
        approvalDate: new Date(),
        approvedBy: session.user.id,
        ...(notes && { notes }),
      };
    } else if (action === 'reject') {
      if (loan.status !== 'pending') {
        return NextResponse.json(
          { error: 'Only pending loans can be rejected' },
          { status: 400 }
        );
      }
      updateData = {
        status: 'rejected',
        ...(notes && { notes }),
      };
    } else if (action === 'disburse') {
      if (loan.status !== 'approved') {
        return NextResponse.json(
          { error: 'Only approved loans can be disbursed' },
          { status: 400 }
        );
      }
      updateData = {
        status: 'disbursed',
        disbursementDate: new Date(),
      };
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const updatedLoan = await Loan.findByIdAndUpdate(
      params.id,
      { $set: updateData },
      { new: true }
    ).populate('userId', 'name email');

    return NextResponse.json(
      { message: `Loan ${action}d successfully`, loan: updatedLoan },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
