import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB, WelfareRequest, User, Chama } from '@/packages/database';

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
    if (!user || !user.chamaId || user.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can approve welfare requests' }, { status: 403 });
    }

    const body = await req.json();
    const { approvedAmount } = body;

    const request = await WelfareRequest.findById(params.id);
    if (!request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    if (request.status !== 'pending') {
      return NextResponse.json({ error: 'Request already processed' }, { status: 400 });
    }

    // Check if chama has sufficient welfare funds
    const chama = await Chama.findById(user.chamaId);
    if (!chama) {
      return NextResponse.json({ error: 'Chama not found' }, { status: 404 });
    }

    const amountToApprove = approvedAmount || request.requestedAmount;

    if (chama.totalWelfareFund < amountToApprove) {
      return NextResponse.json({ error: 'Insufficient welfare funds' }, { status: 400 });
    }

    request.status = 'approved';
    request.approvedAmount = amountToApprove;
    request.approvalDate = new Date();
    request.approvedBy = user._id;

    await request.save();

    const populatedRequest = await WelfareRequest.findById(request._id)
      .populate('requesterId', 'name email phone')
      .populate('approvedBy', 'name');

    return NextResponse.json({
      message: 'Welfare request approved successfully',
      request: populatedRequest,
    });
  } catch (error: any) {
    console.error('Error approving welfare request:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
