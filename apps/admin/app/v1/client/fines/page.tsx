'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, Plus, DollarSign, CheckCircle, XCircle } from 'lucide-react';

interface Fine {
  _id: string;
  userId: any;
  fineType: string;
  amount: number;
  reason: string;
  dueDate: string;
  status: 'pending' | 'paid' | 'waived';
  paymentDate?: string;
  paymentMethod?: string;
  waivedBy?: any;
  waiverReason?: string;
  createdAt: string;
}

export default function FinesPage() {
  const [fines, setFines] = useState<Fine[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ totalPending: 0, totalPaid: 0 });
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid' | 'waived'>('all');

  useEffect(() => {
    fetchFines();
  }, [filter]);

  const fetchFines = async () => {
    try {
      const url = filter === 'all' ? '/api/fines' : `/api/fines?status=${filter}`;
      const res = await fetch(url);
      const data = await res.json();
      setFines(data.fines);
      setSummary(data.summary);
    } catch (error) {
      console.error('Error fetching fines:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayFine = async (fineId: string) => {
    if (!confirm('Mark this fine as paid?')) return;

    try {
      const res = await fetch(`/api/fines/${fineId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethod: 'cash' }),
      });

      if (res.ok) {
        alert('Fine marked as paid');
        fetchFines();
      }
    } catch (error) {
      console.error('Error paying fine:', error);
    }
  };

  const handleWaiveFine = async (fineId: string) => {
    const reason = prompt('Enter waiver reason:');
    if (!reason) return;

    try {
      const res = await fetch(`/api/fines/${fineId}/waive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ waiverReason: reason }),
      });

      if (res.ok) {
        alert('Fine waived successfully');
        fetchFines();
      }
    } catch (error) {
      console.error('Error waiving fine:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Fines & Penalties</h2>
          <p className="text-gray-600 mt-2">Track and manage member fines</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition">
          <Plus className="w-5 h-5" />
          Issue Fine
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending Fines</p>
              <p className="text-2xl font-bold text-red-600">
                KES {summary.totalPending.toLocaleString()}
              </p>
            </div>
            <div className="bg-red-100 text-red-600 p-3 rounded-lg">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Paid Fines</p>
              <p className="text-2xl font-bold text-green-600">
                KES {summary.totalPaid.toLocaleString()}
              </p>
            </div>
            <div className="bg-green-100 text-green-600 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Fines</p>
              <p className="text-2xl font-bold text-gray-900">{fines.length}</p>
            </div>
            <div className="bg-gray-100 text-gray-600 p-3 rounded-lg">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        {(['all', 'pending', 'paid', 'waived'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`pb-3 px-2 font-medium transition ${
              filter === status
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Fines Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Member
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Reason
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Due Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {fines.map((fine) => (
              <tr key={fine._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{fine.userId?.name}</div>
                  <div className="text-sm text-gray-500">{fine.userId?.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <FineTypeBadge type={fine.fineType} />
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{fine.reason}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900">
                    KES {fine.amount.toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {new Date(fine.dueDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={fine.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {fine.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePayFine(fine._id)}
                        className="text-green-600 hover:text-green-800"
                      >
                        Mark Paid
                      </button>
                      <button
                        onClick={() => handleWaiveFine(fine._id)}
                        className="text-yellow-600 hover:text-yellow-800"
                      >
                        Waive
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FineTypeBadge({ type }: { type: string }) {
  const labels: Record<string, string> = {
    late_contribution: 'Late Contribution',
    missed_meeting: 'Missed Meeting',
    late_arrival: 'Late Arrival',
    loan_default: 'Loan Default',
    other: 'Other',
  };

  return (
    <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-800">
      {labels[type] || type}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors = {
    pending: 'bg-red-100 text-red-800',
    paid: 'bg-green-100 text-green-800',
    waived: 'bg-yellow-100 text-yellow-800',
  }[status];

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
