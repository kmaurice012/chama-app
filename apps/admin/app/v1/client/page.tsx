import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { connectDB, Chama, User, Contribution, Loan, Meeting, Fine, RotationCycle, WelfareRequest } from '@chama-app/database';
import { Users, DollarSign, TrendingUp, AlertCircle, Calendar, Repeat, Heart } from 'lucide-react';
import ContributionChart from '@/components/ContributionChart';
import LoanStatusChart from '@/components/LoanStatusChart';

async function getDashboardData(chamaId: string) {
  await connectDB();

  const [chama, members, contributions, loans, contributionTrends, loansByStatus, upcomingMeetings, pendingFines, activeRotations, pendingWelfareRequests] = await Promise.all([
    Chama.findById(chamaId),
    User.countDocuments({ chamaId, isActive: true }),
    Contribution.aggregate([
      { $match: { chamaId: chamaId as any, status: 'paid' } },
      {
        $group: {
          _id: null,
          totalContributions: { $sum: '$amount' },
        },
      },
    ]),
    Loan.aggregate([
      { $match: { chamaId: chamaId as any } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
    ]),
    // Get contribution trends by month (last 6 months)
    Contribution.aggregate([
      { $match: { chamaId: chamaId as any, status: 'paid' } },
      {
        $group: {
          _id: {
            year: { $year: '$paymentDate' },
            month: { $month: '$paymentDate' },
          },
          amount: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 6 },
    ]),
    // Get loan counts by status for pie chart
    Loan.aggregate([
      { $match: { chamaId: chamaId as any } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]),
    // Get upcoming meetings
    Meeting.countDocuments({
      chamaId: chamaId as any,
      scheduledDate: { $gte: new Date() },
      status: { $in: ['scheduled', 'ongoing'] },
    }),
    // Get pending fines count and total
    Fine.aggregate([
      { $match: { chamaId: chamaId as any, status: 'pending' } },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          total: { $sum: '$amount' },
        },
      },
    ]),
    // Get active rotations
    RotationCycle.countDocuments({
      chamaId: chamaId as any,
      status: 'active',
    }),
    // Get pending welfare requests
    WelfareRequest.countDocuments({
      chamaId: chamaId as any,
      status: 'pending',
    }),
  ]);

  const totalContributions = contributions[0]?.totalContributions || 0;
  const activeLoans = loans.find((l) => l._id === 'disbursed')?.count || 0;
  const totalLoansAmount = loans.find((l) => l._id === 'disbursed')?.totalAmount || 0;
  const pendingLoans = loans.find((l) => l._id === 'pending')?.count || 0;

  // Format contribution trends for chart
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const formattedContributionTrends = contributionTrends.map((item: any) => ({
    month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
    amount: item.amount,
  }));

  // Format loan status data for pie chart
  const statusLabels: Record<string, string> = {
    pending: 'Pending',
    approved: 'Approved',
    disbursed: 'Disbursed',
    repaid: 'Repaid',
    defaulted: 'Defaulted',
  };

  const formattedLoanStatus = loansByStatus.map((item: any) => ({
    name: statusLabels[item._id] || item._id,
    value: item.count,
  }));

  return {
    chama,
    members,
    totalContributions,
    activeLoans,
    totalLoansAmount,
    pendingLoans,
    availableFunds: totalContributions - totalLoansAmount,
    contributionTrends: formattedContributionTrends,
    loanStatusData: formattedLoanStatus,
    upcomingMeetings,
    pendingFinesCount: pendingFines[0]?.count || 0,
    pendingFinesTotal: pendingFines[0]?.total || 0,
    activeRotations,
    pendingWelfareRequests,
    welfareBalance: chama?.totalWelfareFund || 0,
  };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  // Redirect super admin to their dashboard
  if (session?.user.role === 'superadmin') {
    redirect('/superadmin');
  }

  const data = await getDashboardData(session!.user.chamaId);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Dashboard Overview</h2>
        <p className="text-gray-600 mt-2">Monitor your chama's financial health</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Members"
          value={data.members}
          icon={<Users className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Total Contributions"
          value={`KES ${data.totalContributions.toLocaleString()}`}
          icon={<DollarSign className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Active Loans"
          value={data.activeLoans}
          subtitle={`KES ${data.totalLoansAmount.toLocaleString()}`}
          icon={<TrendingUp className="w-6 h-6" />}
          color="purple"
        />
        <StatCard
          title="Available Funds"
          value={`KES ${data.availableFunds.toLocaleString()}`}
          icon={<DollarSign className="w-6 h-6" />}
          color="indigo"
        />
      </div>

      {/* New Features Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Upcoming Meetings"
          value={data.upcomingMeetings}
          icon={<Calendar className="w-6 h-6" />}
          color="blue"
          link="/dashboard/meetings"
        />
        <StatCard
          title="Pending Fines"
          value={data.pendingFinesCount}
          subtitle={`KES ${data.pendingFinesTotal.toLocaleString()}`}
          icon={<AlertCircle className="w-6 h-6" />}
          color="red"
          link="/dashboard/fines"
        />
        <StatCard
          title="Active Rotations"
          value={data.activeRotations}
          icon={<Repeat className="w-6 h-6" />}
          color="teal"
          link="/dashboard/rotations"
        />
        <StatCard
          title="Welfare Fund"
          value={`KES ${data.welfareBalance.toLocaleString()}`}
          subtitle={data.pendingWelfareRequests ? `${data.pendingWelfareRequests} pending requests` : undefined}
          icon={<Heart className="w-6 h-6" />}
          color="pink"
          link="/dashboard/welfare"
        />
      </div>

      {/* Chama Details */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Chama Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailItem label="Contribution Amount" value={`KES ${data.chama.contributionAmount.toLocaleString()}`} />
          <DetailItem label="Frequency" value={data.chama.contributionFrequency} />
          <DetailItem label="Loan Interest Rate" value={`${data.chama.loanInterestRate}%`} />
          <DetailItem label="Max Loan Multiplier" value={`${data.chama.maxLoanMultiplier}x`} />
        </div>
      </div>

      {/* Pending Loans Alert */}
      {data.pendingLoans > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-yellow-900">Pending Loan Requests</h4>
            <p className="text-yellow-700 text-sm">
              You have {data.pendingLoans} loan request{data.pendingLoans > 1 ? 's' : ''} waiting for approval.
            </p>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ContributionChart data={data.contributionTrends} />
        {data.loanStatusData.length > 0 && <LoanStatusChart data={data.loanStatusData} />}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <ActionButton href="/dashboard/members" label="Add Member" />
          <ActionButton href="/dashboard/contributions" label="Record Contribution" />
          <ActionButton href="/dashboard/loans" label="Manage Loans" />
          <ActionButton href="/dashboard/meetings" label="Schedule Meeting" />
          <ActionButton href="/dashboard/rotations" label="Create Rotation" />
          <ActionButton href="/dashboard/welfare/requests" label="Submit Welfare Request" />
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
  link,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  link?: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    indigo: 'bg-indigo-500',
    red: 'bg-red-500',
    teal: 'bg-teal-500',
    pink: 'bg-pink-500',
  }[color];

  const content = (
    <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition">
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

  if (link) {
    return (
      <a href={link} className="block">
        {content}
      </a>
    );
  }

  return content;
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-lg font-semibold text-gray-900 capitalize">{value}</p>
    </div>
  );
}

function ActionButton({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="block text-center px-4 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition"
    >
      {label}
    </a>
  );
}
