export const dynamic = 'force-dynamic';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB, Fine } from '@chama-app/database';
import { AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';

async function getFines(userId: string, chamaId: string) {
  await connectDB();

  const fines = await Fine.find({ userId, chamaId })
    .populate('issuedBy', 'name')
    .populate('waivedBy', 'name')
    .sort({ createdAt: -1 })
    .lean();

  const pendingFines = fines.filter((f: any) => f.status === 'pending');
  const paidFines = fines.filter((f: any) => f.status === 'paid');
  const waivedFines = fines.filter((f: any) => f.status === 'waived');

  const totalPending = pendingFines.reduce((sum: number, f: any) => sum + f.amount, 0);
  const totalPaid = paidFines.reduce((sum: number, f: any) => sum + f.amount, 0);

  return {
    fines,
    pendingFines,
    paidFines,
    waivedFines,
    totalPending,
    totalPaid,
    pendingCount: pendingFines.length,
    paidCount: paidFines.length,
  };
}

export default async function FinesPage() {
  const session = await getServerSession(authOptions);
  const data = await getFines(session!.user.id, session!.user.chamaId);

  const fineTypeLabels: Record<string, string> = {
    late_contribution: 'Late Contribution',
    missed_meeting: 'Missed Meeting',
    late_arrival: 'Late Arrival',
    loan_default: 'Loan Default',
    other: 'Other',
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">My Fines</h2>
        <p className="text-gray-600 mt-2">View and manage your fines and penalties</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Pending Fines"
          value={data.pendingCount}
          subtitle={`KES ${data.totalPending.toLocaleString()}`}
          icon={<AlertCircle className="w-6 h-6" />}
          color="bg-red-500"
        />
        <StatCard
          title="Paid Fines"
          value={data.paidCount}
          subtitle={`KES ${data.totalPaid.toLocaleString()}`}
          icon={<CheckCircle className="w-6 h-6" />}
          color="bg-green-500"
        />
        <StatCard
          title="Waived Fines"
          value={data.waivedFines.length}
          subtitle="Forgiven by admin"
          icon={<XCircle className="w-6 h-6" />}
          color="bg-blue-500"
        />
      </div>

      {/* Pending Fines Alert */}
      {data.pendingFines.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-red-900 mb-1">
                You have {data.pendingCount} pending fine{data.pendingCount !== 1 ? 's' : ''}
              </h3>
              <p className="text-sm text-red-700 mb-3">
                Total amount due: <strong>KES {data.totalPending.toLocaleString()}</strong>
              </p>
              <p className="text-sm text-red-600">
                Please pay your fines as soon as possible. Contact your chama admin for payment options.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Fines List */}
      {data.fines.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Fines!</h3>
          <p className="text-gray-600">
            You have a clean record. Keep up the good work!
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.fines.map((fine: any) => (
                  <tr key={fine._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(fine.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                        {fineTypeLabels[fine.fineType] || fine.fineType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {fine.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">
                        KES {fine.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${
                          fine.status === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : fine.status === 'waived'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {fine.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {fine.dueDate ? (
                        <>
                          {new Date(fine.dueDate).toLocaleDateString()}
                          {fine.status === 'pending' &&
                            new Date(fine.dueDate) < new Date() && (
                              <span className="ml-2 text-xs text-red-600 font-medium">
                                Overdue
                              </span>
                            )}
                        </>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Note */}
      {data.pendingFines.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Payment Information
          </h3>
          <p className="text-sm text-blue-800 mb-3">
            To pay your fines, please contact your chama admin or treasurer. Payment methods include:
          </p>
          <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
            <li>M-Pesa transfer to chama account</li>
            <li>Cash payment during meetings</li>
            <li>Bank deposit to chama account</li>
          </ul>
          <p className="text-xs text-blue-600 mt-3 italic">
            Note: Once payment is confirmed, your admin will update the status.
          </p>
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
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>
        <div className={`${color} text-white p-3 rounded-lg`}>{icon}</div>
      </div>
    </div>
  );
}
