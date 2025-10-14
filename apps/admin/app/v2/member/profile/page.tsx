import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB, User, Chama, Contribution, Loan } from '@chama-app/database';
import { User as UserIcon, Mail, Phone, Calendar, MapPin, Shield, DollarSign, TrendingUp } from 'lucide-react';

async function getUserProfile(userId: string, chamaId: string) {
  await connectDB();

  const [user, chama, contributions, loans] = await Promise.all([
    User.findById(userId).select('-password').lean(),
    Chama.findById(chamaId).lean(),
    Contribution.find({ userId, chamaId }),
    Loan.find({ userId, chamaId }),
  ]);

  const totalContributions = contributions.reduce((sum, c) => sum + c.amount, 0);
  const activeLoans = loans.filter((l) => l.status === 'disbursed');
  const totalLoanBalance = activeLoans.reduce((sum, l) => sum + l.balance, 0);
  const totalBorrowed = activeLoans.reduce((sum, l) => sum + l.amount, 0);

  // Calculate membership duration
  const joinDate = new Date((user as any)?.createdAt || new Date());
  const now = new Date();
  const monthsDiff = (now.getFullYear() - joinDate.getFullYear()) * 12 + (now.getMonth() - joinDate.getMonth());

  return {
    user,
    chama,
    totalContributions,
    contributionCount: contributions.length,
    activeLoansCount: activeLoans.length,
    totalLoanBalance,
    totalBorrowed,
    membershipMonths: monthsDiff,
    maxLoanEligible: totalContributions * ((chama as any)?.maxLoanMultiplier || 3),
  };
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  const data = await getUserProfile(session!.user.id, session!.user.chamaId);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">My Profile</h2>
        <p className="text-gray-600 mt-2">View your personal information and chama membership details</p>
      </div>

      {/* Profile Header Card */}
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="flex items-start gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full w-24 h-24 flex items-center justify-center text-3xl font-bold">
            {(data.user as any)?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900">{(data.user as any)?.name || 'User'}</h3>
            <p className="text-gray-600 capitalize flex items-center gap-2 mt-1">
              <Shield className="w-4 h-4" />
              {(data.user as any)?.role || 'member'} Member
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <InfoItem icon={<Mail className="w-4 h-4" />} label="Email" value={(data.user as any)?.email || 'N/A'} />
              <InfoItem icon={<Phone className="w-4 h-4" />} label="Phone" value={(data.user as any)?.phone || 'Not provided'} />
              <InfoItem
                icon={<Calendar className="w-4 h-4" />}
                label="Member Since"
                value={new Date((data.user as any)?.createdAt || new Date()).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              />
              <InfoItem
                icon={<MapPin className="w-4 h-4" />}
                label="Membership Duration"
                value={`${data.membershipMonths} ${data.membershipMonths === 1 ? 'month' : 'months'}`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Chama Information */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">My Chama</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Chama Name</p>
            <p className="text-lg font-semibold text-gray-900">{(data.chama as any)?.name || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Registration Number</p>
            <p className="text-lg font-semibold text-gray-900">{(data.chama as any)?.registrationNumber || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Location</p>
            <p className="text-lg font-semibold text-gray-900">{(data.chama as any)?.location || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Members</p>
            <p className="text-lg font-semibold text-gray-900">{(data.chama as any)?.totalMembers || 0}</p>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Financial Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatItem
            icon={<DollarSign className="w-6 h-6 text-green-600" />}
            label="Total Contributions"
            value={`KES ${data.totalContributions.toLocaleString()}`}
            subtitle={`${data.contributionCount} contributions`}
            bgColor="bg-green-50"
          />
          <StatItem
            icon={<TrendingUp className="w-6 h-6 text-purple-600" />}
            label="Active Loans"
            value={`KES ${data.totalBorrowed.toLocaleString()}`}
            subtitle={`${data.activeLoansCount} ${data.activeLoansCount === 1 ? 'loan' : 'loans'}`}
            bgColor="bg-purple-50"
          />
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-blue-700 mb-1">Loan Eligibility</p>
              <p className="text-2xl font-bold text-blue-900">
                KES {data.maxLoanEligible.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-700 mb-1">Outstanding Balance</p>
              <p className="text-2xl font-bold text-blue-900">
                KES {data.totalLoanBalance.toLocaleString()}
              </p>
            </div>
          </div>
          <p className="text-xs text-blue-600 mt-3">
            Based on {(data.chama as any)?.maxLoanMultiplier || 3}x your total contributions
          </p>
        </div>
      </div>

      {/* Chama Rules */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Chama Rules & Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <RuleItem
            label="Monthly Contribution"
            value={`KES ${(data.chama as any)?.contributionAmount?.toLocaleString() || '0'}`}
          />
          <RuleItem
            label="Contribution Frequency"
            value={(data.chama as any)?.contributionFrequency || 'N/A'}
          />
          <RuleItem
            label="Loan Interest Rate"
            value={`${(data.chama as any)?.loanInterestRate || 0}%`}
          />
          <RuleItem
            label="Max Loan Multiplier"
            value={`${(data.chama as any)?.maxLoanMultiplier || 3}x savings`}
          />
          <RuleItem
            label="Late Payment Fine"
            value={(data.chama as any)?.latePaymentFine ? `KES ${(data.chama as any).latePaymentFine}` : 'Not set'}
          />
          <RuleItem
            label="Missed Meeting Fine"
            value={(data.chama as any)?.missedMeetingFine ? `KES ${(data.chama as any).missedMeetingFine}` : 'Not set'}
          />
        </div>
      </div>

      {/* Account Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Account Settings</h3>
        <div className="space-y-3">
          <ActionButton
            label="Update Profile Information"
            description="Change your name, phone number, or other details"
            disabled
          />
          <ActionButton
            label="Change Password"
            description="Update your account password"
            disabled
          />
          <ActionButton
            label="Notification Preferences"
            description="Manage email and SMS notifications"
            disabled
          />
        </div>
        <p className="text-xs text-gray-500 mt-4 italic">
          Note: Profile editing functionality will be available in the next update. Please contact your admin for any changes.
        </p>
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-gray-600 mt-1">{icon}</div>
      <div>
        <p className="text-xs text-gray-600">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function StatItem({
  icon,
  label,
  value,
  subtitle,
  bgColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle: string;
  bgColor: string;
}) {
  return (
    <div className={`${bgColor} p-4 rounded-lg`}>
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <p className="text-sm font-medium text-gray-700">{label}</p>
      </div>
      <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-xs text-gray-600">{subtitle}</p>
    </div>
  );
}

function RuleItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-lg font-semibold text-gray-900 capitalize">{value}</p>
    </div>
  );
}

function ActionButton({
  label,
  description,
  disabled,
}: {
  label: string;
  description: string;
  disabled?: boolean;
}) {
  return (
    <button
      disabled={disabled}
      className={`w-full text-left p-4 border-2 border-gray-200 rounded-lg transition ${
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
      }`}
    >
      <p className="font-medium text-gray-900">{label}</p>
      <p className="text-sm text-gray-600 mt-1">{description}</p>
    </button>
  );
}
