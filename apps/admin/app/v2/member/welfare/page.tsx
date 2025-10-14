import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB, WelfareRequest, WelfareContribution } from '@chama-app/database';
import { Heart, Clock, CheckCircle, XCircle, TrendingUp } from 'lucide-react';

async function getWelfareData(userId: string, chamaId: string) {
  await connectDB();

  const [requests, contributions] = await Promise.all([
    WelfareRequest.find({ requesterId: userId, chamaId })
      .populate('approvedBy', 'name')
      .sort({ requestDate: -1 })
      .lean(),
    WelfareContribution.find({ userId, chamaId })
      .sort({ date: -1 })
      .lean(),
  ]);

  const pendingRequests = requests.filter((r: any) => r.status === 'pending');
  const approvedRequests = requests.filter((r: any) => r.status === 'approved');
  const rejectedRequests = requests.filter((r: any) => r.status === 'rejected');

  const totalContributions = contributions.reduce((sum: number, c: any) => sum + c.amount, 0);
  const totalApproved = approvedRequests.reduce((sum: number, r: any) => sum + r.amount, 0);

  return {
    requests,
    contributions,
    pendingRequests,
    approvedRequests,
    rejectedRequests,
    totalContributions,
    totalApproved,
    pendingCount: pendingRequests.length,
    approvedCount: approvedRequests.length,
  };
}

export default async function WelfarePage() {
  const session = await getServerSession(authOptions);
  const data = await getWelfareData(session!.user.id, session!.user.chamaId);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Welfare</h2>
        <p className="text-gray-600 mt-2">Track your welfare contributions and requests</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="My Contributions"
          value={`KES ${data.totalContributions.toLocaleString()}`}
          subtitle={`${data.contributions.length} contributions`}
          icon={<Heart className="w-6 h-6" />}
          color="bg-pink-500"
        />
        <StatCard
          title="Approved Requests"
          value={data.approvedCount}
          subtitle={`KES ${data.totalApproved.toLocaleString()} received`}
          icon={<CheckCircle className="w-6 h-6" />}
          color="bg-green-500"
        />
        <StatCard
          title="Pending Requests"
          value={data.pendingCount}
          subtitle="Awaiting approval"
          icon={<Clock className="w-6 h-6" />}
          color="bg-yellow-500"
        />
      </div>

      {/* Info Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <Heart className="w-5 h-5" />
          About Welfare Fund
        </h3>
        <p className="text-sm text-blue-800">
          The welfare fund provides financial support to members during emergencies such as medical expenses,
          bereavement, or other urgent needs. Members contribute regularly to the fund, and approved requests
          are disbursed from the collective pool.
        </p>
      </div>

      {/* My Welfare Requests */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">My Welfare Requests</h3>

        {data.requests.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Welfare Requests</h3>
            <p className="text-gray-600 mb-4">
              You haven't submitted any welfare requests yet.
            </p>
            <p className="text-sm text-gray-500">
              Contact your chama admin if you need to submit a welfare request.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.requests.map((request: any) => (
              <div
                key={request._id}
                className="p-5 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-xl font-bold text-gray-900">
                      KES {request.amount.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600 mt-1 capitalize">
                      {request.requestType.replace('_', ' ')}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 text-sm font-semibold rounded-full capitalize ${
                      request.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : request.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {request.status}
                  </span>
                </div>

                <div className="mb-3">
                  <p className="text-sm text-gray-700">
                    <strong>Reason:</strong> {request.reason}
                  </p>
                </div>

                {request.supportingDocs && request.supportingDocs.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-600 mb-1">Supporting Documents:</p>
                    <div className="flex flex-wrap gap-2">
                      {request.supportingDocs.map((doc: string, index: number) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                        >
                          Document {index + 1}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-gray-200 text-xs text-gray-500">
                  <span>Requested: {new Date(request.requestDate).toLocaleDateString()}</span>
                  {request.approvalDate && (
                    <>
                      <span className="mx-2">•</span>
                      <span>
                        {request.status === 'approved' ? 'Approved' : 'Rejected'}: {new Date(request.approvalDate).toLocaleDateString()}
                      </span>
                    </>
                  )}
                  {request.approvedBy?.name && (
                    <>
                      <span className="mx-2">•</span>
                      <span>By: {request.approvedBy.name}</span>
                    </>
                  )}
                  {request.disbursementDate && (
                    <>
                      <span className="mx-2">•</span>
                      <span>Disbursed: {new Date(request.disbursementDate).toLocaleDateString()}</span>
                    </>
                  )}
                </div>

                {request.adminNotes && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Admin Notes:</p>
                    <p className="text-sm text-gray-800">{request.adminNotes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* My Welfare Contributions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">My Welfare Contributions</h3>

        {data.contributions.length === 0 ? (
          <div className="text-center py-8">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No welfare contributions recorded yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.contributions.map((contribution: any) => (
              <div
                key={contribution._id}
                className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-pink-100 p-2 rounded-lg">
                    <Heart className="w-5 h-5 text-pink-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {new Date(contribution.date).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                    <p className="text-sm text-gray-600 capitalize">
                      {contribution.contributionType}
                      {contribution.notes && (
                        <span className="ml-2 text-xs text-gray-500">
                          • {contribution.notes}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 text-lg">
                    KES {contribution.amount.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Request Help Note */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Need to Submit a Welfare Request?
        </h3>
        <p className="text-sm text-yellow-800 mb-3">
          To submit a welfare request, please contact your chama admin or treasurer with the following information:
        </p>
        <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
          <li>Type of request (medical, bereavement, emergency, etc.)</li>
          <li>Amount needed</li>
          <li>Detailed reason for the request</li>
          <li>Supporting documents (hospital bills, death certificate, etc.)</li>
        </ul>
        <p className="text-xs text-yellow-600 mt-3 italic">
          Note: Welfare request submission functionality will be available in the next update.
        </p>
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
