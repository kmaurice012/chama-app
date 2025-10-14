import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB, Contribution } from '@chama-app/database';
import { DollarSign, Calendar, TrendingUp } from 'lucide-react';

async function getContributions(userId: string, chamaId: string) {
  await connectDB();

  const contributions = await Contribution.find({ userId, chamaId })
    .sort({ year: -1, month: -1 })
    .lean();

  const totalAmount = contributions.reduce((sum, c) => sum + c.amount, 0);
  const currentYear = new Date().getFullYear();
  const thisYearContributions = contributions.filter(c => c.year === currentYear);
  const thisYearTotal = thisYearContributions.reduce((sum, c) => sum + c.amount, 0);

  // Group by year
  const byYear = contributions.reduce((acc: any, contrib) => {
    if (!acc[contrib.year]) {
      acc[contrib.year] = [];
    }
    acc[contrib.year].push(contrib);
    return acc;
  }, {});

  return {
    contributions,
    totalAmount,
    totalCount: contributions.length,
    thisYearTotal,
    thisYearCount: thisYearContributions.length,
    byYear,
  };
}

export default async function ContributionsPage() {
  const session = await getServerSession(authOptions);
  const data = await getContributions(session!.user.id, session!.user.chamaId);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">My Contributions</h2>
        <p className="text-gray-600 mt-2">Track all your contributions and payment history</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Contributions"
          value={`KES ${data.totalAmount.toLocaleString()}`}
          subtitle={`${data.totalCount} payments`}
          icon={<DollarSign className="w-6 h-6" />}
          color="bg-green-500"
        />
        <StatCard
          title="This Year"
          value={`KES ${data.thisYearTotal.toLocaleString()}`}
          subtitle={`${data.thisYearCount} payments`}
          icon={<Calendar className="w-6 h-6" />}
          color="bg-blue-500"
        />
        <StatCard
          title="Average Monthly"
          value={`KES ${data.totalCount > 0 ? Math.round(data.totalAmount / data.totalCount).toLocaleString() : 0}`}
          subtitle="Per contribution"
          icon={<TrendingUp className="w-6 h-6" />}
          color="bg-purple-500"
        />
      </div>

      {/* Contributions by Year */}
      {data.contributions.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Contributions Yet</h3>
          <p className="text-gray-600">
            Your contributions will appear here once they are recorded by your chama admin.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.keys(data.byYear).sort((a, b) => Number(b) - Number(a)).map((year) => {
            const yearContributions = data.byYear[year];
            const yearTotal = yearContributions.reduce((sum: number, c: any) => sum + c.amount, 0);

            return (
              <div key={year} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{year}</h3>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Year Total</p>
                    <p className="text-lg font-bold text-green-600">
                      KES {yearTotal.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {yearContributions.map((contribution: any) => (
                    <div
                      key={contribution._id}
                      className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-green-100 p-2 rounded-lg">
                          <Calendar className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {monthNames[contribution.month - 1]} {contribution.year}
                          </p>
                          <p className="text-sm text-gray-600 capitalize">
                            {contribution.paymentMethod}
                            {contribution.transactionRef && (
                              <span className="ml-2 text-xs text-gray-500">
                                Ref: {contribution.transactionRef}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 text-lg">
                          KES {contribution.amount.toLocaleString()}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 font-medium capitalize">
                            {contribution.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(contribution.paymentDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
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
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>
        <div className={`${color} text-white p-3 rounded-lg`}>{icon}</div>
      </div>
    </div>
  );
}
