import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB, Chama, User, Contribution, Loan } from '@chama-app/database';

// GET platform-wide statistics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const [
      totalChamas,
      activeChamas,
      totalUsers,
      activeUsers,
      totalContributions,
      totalLoans,
      recentChamas,
    ] = await Promise.all([
      Chama.countDocuments(),
      Chama.countDocuments({ isActive: true }),
      User.countDocuments({ role: { $ne: 'superadmin' } }),
      User.countDocuments({ role: { $ne: 'superadmin' }, isActive: true }),
      Contribution.aggregate([
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Loan.aggregate([
        { $match: { status: 'disbursed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Chama.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name createdAt totalMembers totalSavings'),
    ]);

    const stats = {
      totalChamas,
      activeChamas,
      totalUsers,
      activeUsers,
      totalContributions: totalContributions[0]?.total || 0,
      totalLoansAmount: totalLoans[0]?.total || 0,
      recentChamas,
    };

    return NextResponse.json({ stats }, { status: 200 });
  } catch (error: any) {
    console.error('Get stats error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
