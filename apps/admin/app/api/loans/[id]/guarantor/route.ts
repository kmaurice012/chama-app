import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB, Loan, User } from '@/packages/database';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const body = await req.json();
    const { action, rejectionReason } = body; // action: 'accept' or 'reject'

    const loan = await Loan.findById(params.id);
    if (!loan) {
      return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
    }

    // Find the guarantor entry for this user
    const guarantorIndex = loan.guarantors.findIndex(
      (g: any) => g.userId.toString() === user._id.toString()
    );

    if (guarantorIndex === -1) {
      return NextResponse.json({ error: 'You are not a guarantor for this loan' }, { status: 403 });
    }

    if (loan.guarantors[guarantorIndex].status !== 'pending') {
      return NextResponse.json({ error: 'You have already responded to this request' }, { status: 400 });
    }

    // Update guarantor status
    loan.guarantors[guarantorIndex].status = action === 'accept' ? 'accepted' : 'rejected';
    loan.guarantors[guarantorIndex].responseDate = new Date();

    if (action === 'reject' && rejectionReason) {
      loan.guarantors[guarantorIndex].rejectionReason = rejectionReason;
    }

    await loan.save();

    // Check if all guarantors have accepted
    const acceptedGuarantors = loan.guarantors.filter((g: any) => g.status === 'accepted').length;
    const rejectedGuarantors = loan.guarantors.filter((g: any) => g.status === 'rejected').length;

    let message = '';
    if (rejectedGuarantors > 0) {
      message = 'Guarantor request rejected. Loan cannot proceed without all guarantors.';
      // Optionally update loan status to rejected
      if (loan.status === 'pending') {
        loan.rejectionReason = 'One or more guarantors rejected the request';
        await loan.save();
      }
    } else if (acceptedGuarantors >= loan.minimumGuarantors) {
      message = 'All guarantors have accepted. Loan can now be reviewed by admin.';
    } else {
      message = 'Guarantor response recorded. Waiting for other guarantors.';
    }

    const populatedLoan = await Loan.findById(loan._id)
      .populate('userId', 'name email phone')
      .populate('guarantors.userId', 'name email phone');

    return NextResponse.json({
      message,
      loan: populatedLoan,
    });
  } catch (error: any) {
    console.error('Error updating guarantor response:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
