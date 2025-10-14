import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB, RotationDistribution, RotationCycle, User, Chama } from '@chama-app/database';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user || !user.chamaId || user.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can distribute funds' }, { status: 403 });
    }

    const body = await req.json();
    const { contributions, notes } = body;

    const distribution = await RotationDistribution.findById(await params.then(p => p.id));
    if (!distribution) {
      return NextResponse.json({ error: 'Distribution not found' }, { status: 404 });
    }

    if (distribution.status === 'distributed') {
      return NextResponse.json({ error: 'Distribution already completed' }, { status: 400 });
    }

    // Update distribution
    distribution.contributions = contributions.map((c: any) => ({
      ...c,
      paymentDate: c.paymentDate || new Date(),
    }));
    distribution.status = 'distributed';
    distribution.distributionDate = new Date();
    distribution.distributedBy = user._id;
    if (notes) distribution.notes = notes;

    await distribution.save();

    // Update rotation cycle
    const cycle = await RotationCycle.findById(distribution.rotationCycleId);
    if (cycle) {
      const totalContributed = contributions.reduce((sum: number, c: any) => sum + c.amount, 0);
      cycle.totalContributions += totalContributed;
      cycle.currentRecipientIndex += 1;

      // Check if cycle is completed
      if (cycle.currentRecipientIndex >= cycle.rotationOrder.length) {
        cycle.status = 'completed';
      }

      await cycle.save();
    }

    // Update chama totals
    await Chama.findByIdAndUpdate(user.chamaId, {
      $inc: { totalSavings: distribution.amount },
    });

    const populatedDistribution = await RotationDistribution.findById(distribution._id)
      .populate('recipientId', 'name email phone')
      .populate('contributions.userId', 'name')
      .populate('distributedBy', 'name');

    return NextResponse.json({
      message: 'Funds distributed successfully',
      distribution: populatedDistribution,
    });
  } catch (error: any) {
    console.error('Error distributing funds:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
