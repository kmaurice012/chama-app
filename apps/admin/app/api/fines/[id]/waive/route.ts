import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB, Fine, User } from '@chama-app/database';

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
      return NextResponse.json({ error: 'Only admins can waive fines' }, { status: 403 });
    }

    const body = await req.json();
    const { waiverReason } = body;

    const fine = await Fine.findById(params.id);
    if (!fine) {
      return NextResponse.json({ error: 'Fine not found' }, { status: 404 });
    }

    if (fine.status !== 'pending') {
      return NextResponse.json({ error: 'Only pending fines can be waived' }, { status: 400 });
    }

    fine.status = 'waived';
    fine.waivedBy = user._id;
    fine.waiverReason = waiverReason;

    await fine.save();

    const populatedFine = await Fine.findById(fine._id)
      .populate('userId', 'name email phone')
      .populate('issuedBy', 'name')
      .populate('waivedBy', 'name');

    return NextResponse.json({
      message: 'Fine waived successfully',
      fine: populatedFine,
    });
  } catch (error: any) {
    console.error('Error waiving fine:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
