import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB, Chama, User } from '@chama-app/database';

// GET all chamas with stats
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const chamas = await Chama.find().sort({ createdAt: -1 });

    // Get member counts for each chama
    const chamasWithStats = await Promise.all(
      chamas.map(async (chama) => {
        const adminCount = await User.countDocuments({
          chamaId: chama._id,
          role: 'admin',
          isActive: true,
        });

        const memberCount = await User.countDocuments({
          chamaId: chama._id,
          role: 'member',
          isActive: true,
        });

        return {
          ...chama.toObject(),
          adminCount,
          memberCount: memberCount + adminCount,
        };
      })
    );

    return NextResponse.json({ chamas: chamasWithStats }, { status: 200 });
  } catch (error: any) {
    console.error('Get chamas error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
