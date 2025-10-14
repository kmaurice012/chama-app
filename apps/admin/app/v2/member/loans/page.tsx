import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB, Loan } from '@chama-app/database';
import { TrendingUp, AlertCircle, CheckCircle, Clock, Shield } from 'lucide-react';

async function getLoans(userId: string, chamaId: string) {
  await connectDB();

  const [myLoans, guarantorLoans] = await Promise.all([
    Loan.find({ userId, chamaId })
      .populate('approvedBy', 'name')
      .populate('guarantors.userId', 'name')
      .sort({ requestDate: -1 })
      .lean(),
    Loan.find({
      chamaId,
      'guarantors.userId': userId,
    })
      .populate('userId', 'name email phone')
      .populate('guarantors.userId', 'name')
      .sort({ requestDate: -1 })
      .lean(),
  ]);

  const activeLoans = myLoans.filter((l: any) => l.status === 'disbursed');
  const pendingLoans = myLoans.filter((l: any) => l.status === 'pending');
  const totalBorrowed = activeLoans.reduce((sum: number, l: any) => sum + l.amount, 0);
  const totalBalance = activeLoans.reduce((sum: number, l: any) => sum + l.balance, 0);

  // Filter guarantor requests that are still pending
  const pendingGuarantorRequests = guarantorLoans.filter((loan: any) => {
    const myGuarantor = loan.guarantors.find((g: any) =>
      g.userId._id.toString() === userId
    );
    return myGuarantor && myGuarantor.status === 'pending';
  });

  return {
    myLoans,
    guarantorLoans,
    pendingGuarantorRequests,
    activeLoansCount: activeLoans.length,
    pendingLoansCount: pendingLoans.length,
    totalBorrowed,
    totalBalance,
  };
}

export default async function LoansPage() {
  const session = await getServerSession(authOptions);
  const data = await getLoans(session!.user.id, session!.user.chamaId);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">My Loans</h2>
        <p className="text-gray-600 mt-2">Track your loans and guarantor requests</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Active Loans"
          value={data.activeLoansCount}
          subtitle={`KES ${data.totalBorrowed.toLocaleString()} borrowed`}
          icon={<TrendingUp className="w-6 h-6" />}
          color="bg-purple-500"
        />
        <StatCard
          title="Total Balance"
          value={`KES ${data.totalBalance.toLocaleString()}`}
          subtitle="Amount remaining"
          icon={<AlertCircle className="w-6 h-6" />}
          color="bg-red-500"
        />
        <StatCard
          title="Pending Requests"
          value={data.pendingLoansCount}
          subtitle="Awaiting approval"
          icon={<Clock className="w-6 h-6" />}
          color="bg-yellow-500"
        />
      </div>

      {/* Guarantor Requests Alert */}
      {data.pendingGuarantorRequests.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
          <div className="flex items-start gap-3">
            <Shield className="h-6 w-6 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                Guarantor Requests ({data.pendingGuarantorRequests.length})
              </h3>
              <p className="text-sm text-yellow-700 mb-4">
                You have been requested to guarantee the following loan{data.pendingGuarantorRequests.length > 1 ? 's' : ''}.
                Please review and respond.
              </p>
              <div className="space-y-3">
                {data.pendingGuarantorRequests.map((loan: any) => {
                  const borrower = loan.userId;
                  return (
                    <div key={loan._id} className="bg-white p-4 rounded-lg border border-yellow-200">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold text-gray-900">{borrower.name}</p>
                          <p className="text-sm text-gray-600">{borrower.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            KES {loan.amount.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-600">Loan Amount</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">
                        <strong>Purpose:</strong> {loan.purpose}
                      </p>
                      <div className="flex gap-2">
                        <button className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition text-sm">
                          Accept
                        </button>
                        <button className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition text-sm">
                          Decline
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2 italic">
                        Note: These buttons will be functional in the next update. Please contact admin for now.
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* My Loans */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">My Loan History</h3>
        {data.myLoans.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Loans Yet</h3>
            <p className="text-gray-600">
              You haven't requested any loans yet. Contact your chama admin to request a loan.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.myLoans.map((loan: any) => (
              <div
                key={loan._id}
                className="p-5 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-xl font-bold text-gray-900">
                      KES {loan.amount.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">{loan.purpose}</p>
                  </div>
                  <span
                    className={`px-3 py-1 text-sm font-semibold rounded-full capitalize ${
                      loan.status === 'disbursed'
                        ? 'bg-purple-100 text-purple-800'
                        : loan.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : loan.status === 'approved'
                        ? 'bg-blue-100 text-blue-800'
                        : loan.status === 'repaid'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {loan.status}
                  </span>
                </div>

                {loan.status === 'disbursed' && (
                  <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Loan Amount</p>
                      <p className="text-sm font-semibold text-gray-900">
                        KES {loan.amount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Total + Interest</p>
                      <p className="text-sm font-semibold text-gray-900">
                        KES {loan.totalAmount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Paid</p>
                      <p className="text-sm font-semibold text-green-600">
                        KES {loan.amountPaid.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Balance</p>
                      <p className="text-sm font-semibold text-red-600">
                        KES {loan.balance.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {loan.guarantors && loan.guarantors.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Guarantors:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {loan.guarantors.map((guarantor: any, index: number) => (
                        <span
                          key={index}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            guarantor.status === 'accepted'
                              ? 'bg-green-100 text-green-800'
                              : guarantor.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {guarantor.userId?.name || 'Unknown'} • {guarantor.status}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                  <span>Requested: {new Date(loan.requestDate).toLocaleDateString()}</span>
                  {loan.approvalDate && (
                    <span className="ml-4">
                      Approved: {new Date(loan.approvalDate).toLocaleDateString()}
                    </span>
                  )}
                  {loan.disbursementDate && (
                    <span className="ml-4">
                      Disbursed: {new Date(loan.disbursementDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Loans I'm Guaranteeing */}
      {data.guarantorLoans.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            Loans I'm Guaranteeing
          </h3>
          <div className="space-y-3">
            {data.guarantorLoans.map((loan: any) => {
              const myGuarantorStatus = loan.guarantors.find(
                (g: any) => g.userId._id.toString() === session!.user.id
              )?.status;

              return (
                <div
                  key={loan._id}
                  className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900">{loan.userId.name}</p>
                      <p className="text-sm text-gray-600">KES {loan.amount.toLocaleString()}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`px-2 py-1 text-xs rounded-full font-medium capitalize ${
                          loan.status === 'disbursed'
                            ? 'bg-purple-100 text-purple-800'
                            : loan.status === 'repaid'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {loan.status}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs rounded-full font-medium capitalize ${
                          myGuarantorStatus === 'accepted'
                            ? 'bg-green-100 text-green-800'
                            : myGuarantorStatus === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        You: {myGuarantorStatus}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
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
