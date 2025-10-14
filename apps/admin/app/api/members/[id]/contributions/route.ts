import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB, Contribution } from '@chama-app/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.chamaId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const contributions = await Contribution.find({
      userId: await params.then(p => p.id),
      chamaId: session.user.chamaId,
    }).sort({ year: -1, month: -1 });

    return NextResponse.json({ contributions });
  } catch (error) {
    console.error('Error fetching member contributions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contributions' },
      { status: 500 }
    );
  }
}
