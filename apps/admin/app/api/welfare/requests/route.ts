import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB, WelfareRequest, User, Chama } from '@/packages/database';

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

    // Members can only see their own requests
    if (user.role === 'member') {
      filter.requesterId = user._id;
    } else if (status) {
      filter.status = status;
    }

    const requests = await WelfareRequest.find(filter)
      .populate('requesterId', 'name email phone')
      .populate('approvedBy', 'name')
      .populate('disbursedBy', 'name')
      .populate('votes.userId', 'name')
      .sort({ requestDate: -1 });

    return NextResponse.json({ requests });
  } catch (error: any) {
    console.error('Error fetching welfare requests:', error);
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
    if (!user || !user.chamaId) {
      return NextResponse.json({ error: 'User not found or not in a chama' }, { status: 404 });
    }

    const body = await req.json();
    const { requestType, title, description, requestedAmount, supportingDocuments } = body;

    const request = await WelfareRequest.create({
      chamaId: user.chamaId,
      requesterId: user._id,
      requestType,
      title,
      description,
      requestedAmount,
      supportingDocuments: supportingDocuments || [],
    });

    const populatedRequest = await WelfareRequest.findById(request._id)
      .populate('requesterId', 'name email phone');

    return NextResponse.json({
      message: 'Welfare request submitted successfully',
      request: populatedRequest,
    });
  } catch (error: any) {
    console.error('Error creating welfare request:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
