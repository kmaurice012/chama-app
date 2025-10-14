'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, DollarSign, TrendingUp, Calendar, Download } from 'lucide-react';
import { unparse } from 'papaparse';

interface Member {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  dateJoined: string;
  isActive: boolean;
}

interface Contribution {
  _id: string;
  amount: number;
  month: number;
  year: number;
  paymentDate: string;
  paymentMethod: string;
  transactionRef?: string;
  status: string;
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export default function MemberDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const memberId = params.id as string;

  const [member, setMember] = useState<Member | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (memberId) {
      fetchMemberDetails();
      fetchContributions();
    }
  }, [memberId]);

  const fetchMemberDetails = async () => {
    try {
      const response = await fetch(`/api/members/${memberId}`);
      const data = await response.json();
      setMember(data.member);
    } catch (error) {
      console.error('Error fetching member details:', error);
    }
  };

  const fetchContributions = async () => {
    try {
      const response = await fetch(`/api/members/${memberId}/contributions`);
      const data = await response.json();
      setContributions(data.contributions);
    } catch (error) {
      console.error('Error fetching contributions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalContributions = contributions.reduce((sum, c) => sum + c.amount, 0);
  const completedContributions = contributions.filter((c) => c.status === 'completed').length;

  const exportToCSV = () => {
    const csvData = contributions.map((c) => ({
      Month: MONTHS[c.month - 1],
      Year: c.year,
      Amount: c.amount,
      'Payment Method': c.paymentMethod,
      'Payment Date': new Date(c.paymentDate).toLocaleDateString(),
      'Transaction Ref': c.transactionRef || '',
      Status: c.status,
    }));

    const csv = unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `${member?.name.replace(/\s+/g, '_')}_contributions_${new Date().toISOString().split('T')[0]}.csv`
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-600">Member not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/dashboard/members')}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-gray-900">{member.name}</h2>
          <p className="text-gray-600 mt-1">Member Contribution History</p>
        </div>
        <button
          onClick={exportToCSV}
          disabled={contributions.length === 0}
          className="flex items-center gap-2 px-4 py-2 border-2 border-primary-600 text-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition disabled:opacity-50"
        >
          <Download className="w-5 h-5" />
          Export CSV
        </button>
      </div>

      {/* Member Info */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Member Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="text-lg font-semibold text-gray-900">{member.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Phone</p>
            <p className="text-lg font-semibold text-gray-900">{member.phone}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Date Joined</p>
            <p className="text-lg font-semibold text-gray-900">
              {new Date(member.dateJoined).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Contributions</p>
              <p className="text-2xl font-bold text-gray-900">
                KES {totalContributions.toLocaleString()}
              </p>
            </div>
            <div className="bg-green-500 text-white p-3 rounded-lg">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Completed Payments</p>
              <p className="text-2xl font-bold text-gray-900">{completedContributions}</p>
            </div>
            <div className="bg-blue-500 text-white p-3 rounded-lg">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Months</p>
              <p className="text-2xl font-bold text-gray-900">{contributions.length}</p>
            </div>
            <div className="bg-purple-500 text-white p-3 rounded-lg">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Contributions Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Contribution History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Payment Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Payment Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Transaction Ref
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {contributions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No contributions yet
                  </td>
                </tr>
              ) : (
                contributions.map((contribution) => (
                  <tr key={contribution._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-900">
                      {MONTHS[contribution.month - 1]} {contribution.year}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      KES {contribution.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 uppercase">
                        {contribution.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(contribution.paymentDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {contribution.transactionRef || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 capitalize">
                        {contribution.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
