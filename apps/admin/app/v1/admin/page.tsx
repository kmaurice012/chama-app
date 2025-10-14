import { connectDB, Chama, User, Contribution, Loan, Meeting, Fine, RotationCycle, WelfareRequest } from '@chama-app/database';
import { Building2, Users, DollarSign, TrendingUp, Activity, Calendar, AlertCircle, Repeat, Heart } from 'lucide-react';
import PlatformGrowthChart from '@/components/PlatformGrowthChart';

async function getStats() {
  await connectDB();

  const [
    totalChamas,
    activeChamas,
    totalUsers,
    activeUsers,
    totalContributions,
    totalLoans,
    recentChamas,
    chamaGrowth,
    userGrowth,
    totalMeetings,
    totalFines,
    activeRotations,
    totalWelfareRequests,
  ] = await Promise.all([
    Chama.countDocuments(),
    Chama.countDocuments({ isActive: true }),
    User.countDocuments({ role: { $ne: 'superadmin' } }),
    User.countDocuments({ role: { $ne: 'superadmin' }, isActive: true }),
    Contribution.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Loan.aggregate([
      { $match: { status: 'disbursed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Chama.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name createdAt totalMembers totalSavings')
      .lean(),
    // Get chama registration trends by month
    Chama.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 6 },
    ]),
    // Get user registration trends by month
    User.aggregate([
      { $match: { role: { $ne: 'superadmin' } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 6 },
    ]),
    // Platform-wide meeting stats
    Meeting.countDocuments(),
    // Platform-wide fines stats
    Fine.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    // Platform-wide active rotations
    RotationCycle.countDocuments({ status: 'active' }),
    // Platform-wide welfare requests
    WelfareRequest.countDocuments(),
  ]);

  // Format growth data for chart
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const growthData: Record<string, { month: string; chamas: number; users: number }> = {};

  chamaGrowth.forEach((item: any) => {
    const key = `${item._id.year}-${item._id.month}`;
    const month = `${monthNames[item._id.month - 1]} ${item._id.year}`;
    if (!growthData[key]) {
      growthData[key] = { month, chamas: 0, users: 0 };
    }
    growthData[key].chamas = item.count;
  });

  userGrowth.forEach((item: any) => {
    const key = `${item._id.year}-${item._id.month}`;
    const month = `${monthNames[item._id.month - 1]} ${item._id.year}`;
    if (!growthData[key]) {
      growthData[key] = { month, chamas: 0, users: 0 };
    }
    growthData[key].users = item.count;
  });

  const formattedGrowthData = Object.values(growthData);

  return {
    totalChamas,
    activeChamas,
    totalUsers,
    activeUsers,
    totalContributions: totalContributions[0]?.total || 0,
    totalLoansAmount: totalLoans[0]?.total || 0,
    recentChamas,
    growthData: formattedGrowthData,
    totalMeetings,
    totalFinesAmount: totalFines[0]?.total || 0,
    activeRotations,
    totalWelfareRequests,
  };
}

export default async function SuperAdminPage() {
  const stats = await getStats();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Platform Overview</h2>
        <p className="text-gray-600 mt-2">Monitor all chamas and platform activity</p>
      </div>

      {/* Stats Grid - Main */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Chamas"
          value={stats.totalChamas}
          subtitle={`${stats.activeChamas} active`}
          icon={<Building2 className="w-6 h-6" />}
          color="purple"
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          subtitle={`${stats.activeUsers} active`}
          icon={<Users className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Total Contributions"
          value={`KES ${stats.totalContributions.toLocaleString()}`}
          icon={<DollarSign className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Total Loans"
          value={`KES ${stats.totalLoansAmount.toLocaleString()}`}
          icon={<TrendingUp className="w-6 h-6" />}
          color="orange"
        />
      </div>

      {/* Stats Grid - Platform Activities */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Meetings"
          value={stats.totalMeetings}
          icon={<Calendar className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Total Fines"
          value={`KES ${stats.totalFinesAmount.toLocaleString()}`}
          icon={<AlertCircle className="w-6 h-6" />}
          color="red"
        />
        <StatCard
          title="Active Rotations"
          value={stats.activeRotations}
          icon={<Repeat className="w-6 h-6" />}
          color="teal"
        />
        <StatCard
          title="Welfare Requests"
          value={stats.totalWelfareRequests}
          icon={<Heart className="w-6 h-6" />}
          color="pink"
        />
      </div>

      {/* Platform Growth Chart */}
      {stats.growthData.length > 0 && <PlatformGrowthChart data={stats.growthData} />}

      {/* Recent Chamas */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-600" />
          Recently Registered Chamas
        </h3>
        <div className="space-y-4">
          {stats.recentChamas && stats.recentChamas.length > 0 ? (
            stats.recentChamas.map((chama: any) => (
              <div
                key={chama._id}
                className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                <div>
                  <h4 className="font-semibold text-gray-900">{chama.name}</h4>
                  <p className="text-sm text-gray-600">
                    {chama.totalMembers} members • KES {chama.totalSavings.toLocaleString()} savings
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    {new Date(chama.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No chamas yet</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6 border border-purple-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ActionButton href="/superadmin/chamas" label="View All Chamas" />
          <ActionButton href="/superadmin/users" label="Manage Users" />
          <ActionButton href="/superadmin/reports" label="Generate Reports" />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
}) {
  const colorClasses = {
    purple: 'bg-purple-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
    teal: 'bg-teal-500',
    pink: 'bg-pink-500',
  }[color];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`${colorClasses} text-white p-3 rounded-lg`}>{icon}</div>
      </div>
    </div>
  );
}

function ActionButton({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="block text-center px-4 py-3 bg-white text-purple-600 border-2 border-purple-600 rounded-lg font-semibold hover:bg-purple-600 hover:text-white transition"
    >
      {label}
    </a>
  );
}
