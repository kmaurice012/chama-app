'use client';

import { useState, useEffect } from 'react';
import { Plus, Filter, CheckCircle, XCircle, Send, DollarSign, Download } from 'lucide-react';
import { unparse } from 'papaparse';

interface Member {
  _id: string;
  name: string;
  email: string;
}

interface Loan {
  _id: string;
  userId: Member;
  amount: number;
  interestRate: number;
  totalAmount: number;
  purpose: string;
  requestDate: string;
  approvalDate?: string;
  disbursementDate?: string;
  dueDate: string;
  status: string;
  amountPaid: number;
  balance: number;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-blue-100 text-blue-800',
  rejected: 'bg-red-100 text-red-800',
  disbursed: 'bg-purple-100 text-purple-800',
  repaid: 'bg-green-100 text-green-800',
  defaulted: 'bg-red-100 text-red-800',
};

export default function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

  useEffect(() => {
    fetchMembers();
    fetchLoans();
  }, [filterStatus]);

  const fetchMembers = async () => {
    try {
      const response = await fetch('/api/members');
      const data = await response.json();
      setMembers(data.members.filter((m: any) => m.isActive));
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const fetchLoans = async () => {
    try {
      let url = '/api/loans';
      if (filterStatus) url += `?status=${filterStatus}`;

      const response = await fetch(url);
      const data = await response.json();
      setLoans(data.loans);
    } catch (error) {
      console.error('Error fetching loans:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoanAction = async (loanId: string, action: string) => {
    try {
      const response = await fetch(`/api/loans/${loanId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        fetchLoans();
        setSelectedLoan(null);
      }
    } catch (error) {
      console.error('Error updating loan:', error);
    }
  };

  const exportToCSV = () => {
    const csvData = loans.map((loan) => ({
      Member: loan.userId?.name || 'Unknown',
      Email: loan.userId?.email || '',
      'Loan Amount': loan.amount,
      'Interest Rate': `${loan.interestRate}%`,
      'Total Amount': loan.totalAmount,
      'Amount Paid': loan.amountPaid,
      Balance: loan.balance,
      Purpose: loan.purpose,
      Status: loan.status,
      'Request Date': new Date(loan.requestDate).toLocaleDateString(),
      'Approval Date': loan.approvalDate
        ? new Date(loan.approvalDate).toLocaleDateString()
        : '',
      'Disbursement Date': loan.disbursementDate
        ? new Date(loan.disbursementDate).toLocaleDateString()
        : '',
      'Due Date': new Date(loan.dueDate).toLocaleDateString(),
    }));

    const csv = unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `loans_${filterStatus || 'all'}_${new Date().toISOString().split('T')[0]}.csv`
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Loans</h2>
          <p className="text-gray-600 mt-2">Manage loan requests and repayments</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportToCSV}
            disabled={loans.length === 0}
            className="flex items-center gap-2 px-4 py-2 border-2 border-primary-600 text-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-5 h-5" />
            Export CSV
          </button>
          <button
            onClick={() => setShowRequestForm(!showRequestForm)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition"
          >
            <Plus className="w-5 h-5" />
            New Loan Request
          </button>
        </div>
      </div>

      {showRequestForm && (
        <LoanRequestForm
          members={members}
          onClose={() => setShowRequestForm(false)}
          onSuccess={() => {
            setShowRequestForm(false);
            fetchLoans();
          }}
        />
      )}

      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filter by status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Loans</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="disbursed">Disbursed</option>
            <option value="repaid">Repaid</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="grid gap-6">
          {loans.map((loan) => (
            <div key={loan._id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {loan.userId?.name || 'Unknown'}
                    </h3>
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${
                        STATUS_COLORS[loan.status]
                      }`}
                    >
                      {loan.status}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{loan.purpose}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Loan Amount</p>
                      <p className="text-lg font-semibold text-gray-900">
                        KES {loan.amount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="text-lg font-semibold text-gray-900">
                        KES {loan.totalAmount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Amount Paid</p>
                      <p className="text-lg font-semibold text-green-600">
                        KES {loan.amountPaid.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Balance</p>
                      <p className="text-lg font-semibold text-red-600">
                        KES {loan.balance.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-6 mt-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Interest Rate:</span> {loan.interestRate}%
                    </div>
                    <div>
                      <span className="font-medium">Due Date:</span>{' '}
                      {new Date(loan.dueDate).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Request Date:</span>{' '}
                      {new Date(loan.requestDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  {loan.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleLoanAction(loan._id, 'approve')}
                        className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleLoanAction(loan._id, 'reject')}
                        className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </>
                  )}
                  {loan.status === 'approved' && (
                    <button
                      onClick={() => handleLoanAction(loan._id, 'disburse')}
                      className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700"
                    >
                      <Send className="w-4 h-4" />
                      Disburse
                    </button>
                  )}
                  {loan.status === 'disbursed' && loan.balance > 0 && (
                    <button
                      onClick={() => setSelectedLoan(loan)}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
                    >
                      <DollarSign className="w-4 h-4" />
                      Record Payment
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedLoan && (
        <RepaymentModal
          loan={selectedLoan}
          onClose={() => setSelectedLoan(null)}
          onSuccess={() => {
            setSelectedLoan(null);
            fetchLoans();
          }}
        />
      )}
    </div>
  );
}

function LoanRequestForm({
  members,
  onClose,
  onSuccess,
}: {
  members: Member[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    userId: '',
    amount: '',
    purpose: '',
    dueDate: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: Number(formData.amount),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create loan request');
      }

      onSuccess();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">New Loan Request</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Member *
            </label>
            <select
              required
              value={formData.userId}
              onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select member</option>
              {members.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (KES) *
            </label>
            <input
              type="number"
              required
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date *
            </label>
            <input
              type="date"
              required
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Purpose *
          </label>
          <textarea
            required
            value={formData.purpose}
            onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:bg-gray-400"
          >
            {isLoading ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );
}

function RepaymentModal({
  loan,
  onClose,
  onSuccess,
}: {
  loan: Loan;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: 'mpesa',
    transactionRef: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`/api/loans/${loan._id}/repay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: Number(formData.amount),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to record repayment');
      }

      onSuccess();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Record Loan Repayment</h3>

        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">Outstanding Balance</div>
          <div className="text-2xl font-bold text-gray-900">
            KES {loan.balance.toLocaleString()}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (KES) *
            </label>
            <input
              type="number"
              required
              min="0"
              max={loan.balance}
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method *
            </label>
            <select
              required
              value={formData.paymentMethod}
              onChange={(e) =>
                setFormData({ ...formData, paymentMethod: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="mpesa">M-Pesa</option>
              <option value="cash">Cash</option>
              <option value="bank">Bank Transfer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transaction Reference
            </label>
            <input
              type="text"
              value={formData.transactionRef}
              onChange={(e) =>
                setFormData({ ...formData, transactionRef: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:bg-gray-400"
            >
              {isLoading ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
