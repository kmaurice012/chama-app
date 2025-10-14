import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB, Contribution, Loan, Chama, Fine, WelfareRequest } from '@chama-app/database';
import { DollarSign, TrendingUp, Calendar, AlertCircle, Heart } from 'lucide-react';

async function getMemberData(userId: string, chamaId: string) {
  await connectDB();

  const [chama, contributions, loans, fines, welfareRequests, guarantorLoans] = await Promise.all([
    Chama.findById(chamaId),
    Contribution.find({ userId, chamaId }).sort({ year: -1, month: -1 }),
    Loan.find({ userId, chamaId }).sort({ requestDate: -1 }),
    Fine.find({ userId, chamaId, status: 'pending' }),
    WelfareRequest.find({ requesterId: userId, chamaId }).sort({ requestDate: -1 }),
    Loan.find({
      chamaId,
      'guarantors.userId': userId,
      'guarantors.status': 'pending'
    }).populate('userId', 'name'),
  ]);

  const totalContributions = contributions.reduce((sum, c) => sum + c.amount, 0);
  const pendingLoans = loans.filter((l) => l.status === 'pending').length;
  const activeLoans = loans.filter((l) => l.status === 'disbursed');
  const totalLoanBalance = activeLoans.reduce((sum, l) => sum + l.balance, 0);
  const totalPendingFines = fines.reduce((sum, f) => sum + f.amount, 0);

  return {
    chama,
    totalContributions,
    contributionCount: contributions.length,
    pendingLoans,
    activeLoansCount: activeLoans.length,
    totalLoanBalance,
    recentContributions: contributions.slice(0, 5),
    recentLoans: loans.slice(0, 3),
    pendingFines: fines.length,
    totalPendingFines,
    pendingWelfareRequests: welfareRequests.filter(r => r.status === 'pending').length,
    guarantorRequests: guarantorLoans.length,
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
          title="Pending Fines"
          value={data.pendingFines}
          subtitle={`KES ${data.totalPendingFines.toLocaleString()}`}
          icon={<AlertCircle className="w-6 h-6" />}
          color="red"
          link="/member/fines"
        />
        <StatCard
          title="Welfare Requests"
          value={data.pendingWelfareRequests}
          subtitle="Pending approval"
          icon={<Heart className="w-6 h-6" />}
          color="pink"
          link="/member/welfare"
        />
      </div>

      {/* Guarantor Requests Alert */}
      {data.guarantorRequests > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Guarantor Request{data.guarantorRequests > 1 ? 's' : ''}
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  You have {data.guarantorRequests} loan guarantor request{data.guarantorRequests > 1 ? 's' : ''} waiting for your response.
                </p>
                <a
                  href="/member/loans"
                  className="mt-2 inline-block font-medium text-yellow-800 hover:text-yellow-900 underline"
                >
                  Review Requests →
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

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
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
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
    return <a href={link}>{content}</a>;
  }

  return content;
}

function RuleItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-lg font-semibold text-gray-900 capitalize">{value}</p>
    </div>
  );
}
