import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB, Fine, User, Chama } from '@/packages/database';

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
    const { paymentMethod, transactionRef } = body;

    const fine = await Fine.findById(params.id);
    if (!fine) {
      return NextResponse.json({ error: 'Fine not found' }, { status: 404 });
    }

    if (fine.status === 'paid') {
      return NextResponse.json({ error: 'Fine already paid' }, { status: 400 });
    }

    // Update fine status
    fine.status = 'paid';
    fine.paymentDate = new Date();
    fine.paymentMethod = paymentMethod;
    if (transactionRef) fine.transactionRef = transactionRef;

    await fine.save();

    // Update chama total savings (fines go to chama fund)
    await Chama.findByIdAndUpdate(user.chamaId, {
      $inc: { totalSavings: fine.amount },
    });

    const populatedFine = await Fine.findById(fine._id)
      .populate('userId', 'name email phone')
      .populate('issuedBy', 'name');

    return NextResponse.json({
      message: 'Fine paid successfully',
      fine: populatedFine,
    });
  } catch (error: any) {
    console.error('Error paying fine:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
