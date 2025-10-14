import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB, Contribution, Loan, Chama } from '@chama-app/database';
import { DollarSign, TrendingUp, Calendar, AlertCircle } from 'lucide-react';

async function getMemberData(userId: string, chamaId: string) {
  await connectDB();

  const [chama, contributions, loans] = await Promise.all([
    Chama.findById(chamaId),
    Contribution.find({ userId, chamaId }).sort({ year: -1, month: -1 }),
    Loan.find({ userId, chamaId }).sort({ requestDate: -1 }),
  ]);

  const totalContributions = contributions.reduce((sum, c) => sum + c.amount, 0);
  const pendingLoans = loans.filter((l) => l.status === 'pending').length;
  const activeLoans = loans.filter((l) => l.status === 'disbursed');
  const totalLoanBalance = activeLoans.reduce((sum, l) => sum + l.balance, 0);

  return {
    chama,
    totalContributions,
    contributionCount: contributions.length,
    pendingLoans,
    activeLoansCount: activeLoans.length,
    totalLoanBalance,
    recentContributions: contributions.slice(0, 5),
    recentLoans: loans.slice(0, 3),
  };
}

export default async function MemberDashboard() {
  const session = await getServerSession(authOptions);
  const data = await getMemberData(session!.user.id, session!.user.chamaId);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">My Dashboard</h2>
        <p className="text-gray-600 mt-2">Track your contributions and loans</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="My Total Savings"
          value={`KES ${data.totalContributions.toLocaleString()}`}
          subtitle={`${data.contributionCount} contributions`}
          icon={<DollarSign className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Active Loans"
          value={data.activeLoansCount}
          subtitle={`Balance: KES ${data.totalLoanBalance.toLocaleString()}`}
          icon={<TrendingUp className="w-6 h-6" />}
          color="purple"
        />
        <StatCard
          title="Pending Requests"
          value={data.pendingLoans}
          subtitle="Awaiting approval"
          icon={<Calendar className="w-6 h-6" />}
          color="orange"
        />
      </div>

      {/* Chama Rules */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Chama Rules</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RuleItem
            label="Monthly Contribution"
            value={`KES ${data.chama.contributionAmount.toLocaleString()}`}
          />
          <RuleItem
            label="Contribution Frequency"
            value={data.chama.contributionFrequency}
          />
          <RuleItem
            label="Loan Interest Rate"
            value={`${data.chama.loanInterestRate}%`}
          />
          <RuleItem
            label="Maximum Loan"
            value={`${data.chama.maxLoanMultiplier}x your savings`}
          />
        </div>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> You can borrow up to{' '}
            <strong>
              KES {(data.totalContributions * data.chama.maxLoanMultiplier).toLocaleString()}
            </strong>{' '}
            based on your current savings.
          </p>
        </div>
      </div>

      {/* Recent Contributions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Recent Contributions
        </h3>
        {data.recentContributions.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No contributions yet</p>
        ) : (
          <div className="space-y-3">
            {data.recentContributions.map((contribution: any) => (
              <div
                key={contribution._id}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {new Date(contribution.paymentDate).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                  <p className="text-sm text-gray-600 capitalize">
                    {contribution.paymentMethod}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    KES {contribution.amount.toLocaleString()}
                  </p>
                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                    {contribution.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Loans */}
      {data.recentLoans.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">My Loans</h3>
          <div className="space-y-3">
            {data.recentLoans.map((loan: any) => (
              <div
                key={loan._id}
                className="p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">
                      KES {loan.amount.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">{loan.purpose}</p>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${
                      loan.status === 'disbursed'
                        ? 'bg-purple-100 text-purple-800'
                        : loan.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : loan.status === 'approved'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {loan.status}
                  </span>
                </div>
                {loan.status === 'disbursed' && (
                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-200">
                    <div>
                      <p className="text-xs text-gray-600">Total Amount</p>
                      <p className="text-sm font-semibold text-gray-900">
                        KES {loan.totalAmount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Paid</p>
                      <p className="text-sm font-semibold text-green-600">
                        KES {loan.amountPaid.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Balance</p>
                      <p className="text-sm font-semibold text-red-600">
                        KES {loan.balance.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
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
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
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

function RuleItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-lg font-semibold text-gray-900 capitalize">{value}</p>
    </div>
  );
}
