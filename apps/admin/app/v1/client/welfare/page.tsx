'use client';

import { useState, useEffect } from 'react';
import { Heart, Plus, DollarSign, Users, TrendingUp } from 'lucide-react';

interface WelfareRequest {
  _id: string;
  requesterId: any;
  requestType: string;
  title: string;
  description: string;
  requestedAmount: number;
  approvedAmount?: number;
  status: 'pending' | 'approved' | 'rejected' | 'disbursed';
  requestDate: string;
  approvalDate?: string;
  disbursementDate?: string;
}

export default function WelfarePage() {
  const [requests, setRequests] = useState<WelfareRequest[]>([]);
  const [totalFund, setTotalFund] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'requests' | 'contributions'>('requests');

  useEffect(() => {
    fetchWelfareData();
  }, []);

  const fetchWelfareData = async () => {
    try {
      const [requestsRes, contributionsRes] = await Promise.all([
        fetch('/api/welfare/requests'),
        fetch('/api/welfare/contributions'),
      ]);

      const requestsData = await requestsRes.json();
      const contributionsData = await contributionsRes.json();

      setRequests(requestsData.requests);
      setTotalFund(contributionsData.totalWelfareFund);
    } catch (error) {
      console.error('Error fetching welfare data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string, amount: number) => {
    try {
      const res = await fetch(`/api/welfare/requests/${requestId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvedAmount: amount }),
      });

      if (res.ok) {
        alert('Request approved successfully');
        fetchWelfareData();
      }
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const approvedRequests = requests.filter((r) => r.status === 'approved');

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
          <h2 className="text-3xl font-bold text-gray-900">Welfare Fund</h2>
          <p className="text-gray-600 mt-2">Manage welfare contributions and assistance requests</p>
        </div>
        <div className="flex gap-3">
          <a
            href="/dashboard/welfare/contribute"
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <Plus className="w-5 h-5" />
            Record Contribution
          </a>
          <a
            href="/dashboard/welfare/request"
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            <Plus className="w-5 h-5" />
            Submit Request
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Fund</p>
              <p className="text-2xl font-bold text-green-600">
                KES {totalFund.toLocaleString()}
              </p>
            </div>
            <div className="bg-green-100 text-green-600 p-3 rounded-lg">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending Requests</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingRequests.length}</p>
            </div>
            <div className="bg-yellow-100 text-yellow-600 p-3 rounded-lg">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Approved Requests</p>
              <p className="text-2xl font-bold text-blue-600">{approvedRequests.length}</p>
            </div>
            <div className="bg-blue-100 text-blue-600 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
            </div>
            <div className="bg-gray-100 text-gray-600 p-3 rounded-lg">
              <Heart className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-3 px-2 font-medium transition ${
            activeTab === 'requests'
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Requests ({requests.length})
        </button>
        <button
          onClick={() => setActiveTab('contributions')}
          className={`pb-3 px-2 font-medium transition ${
            activeTab === 'contributions'
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Contributions
        </button>
      </div>

      {/* Content */}
      {activeTab === 'requests' ? (
        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No welfare requests</h3>
              <p className="text-gray-600 mb-4">No welfare assistance requests have been submitted</p>
              <a
                href="/dashboard/welfare/request"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                <Plus className="w-5 h-5" />
                Submit Request
              </a>
            </div>
          ) : (
            requests.map((request) => (
              <div
                key={request._id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{request.title}</h3>
                      <RequestTypeBadge type={request.requestType} />
                      <StatusBadge status={request.status} />
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{request.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Requester</p>
                        <p className="font-semibold text-gray-900">{request.requesterId?.name}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Requested Amount</p>
                        <p className="font-semibold text-gray-900">
                          KES {request.requestedAmount.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Request Date</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(request.requestDate).toLocaleDateString()}
                        </p>
                      </div>
                      {request.approvedAmount && (
                        <div>
                          <p className="text-gray-600">Approved Amount</p>
                          <p className="font-semibold text-green-600">
                            KES {request.approvedAmount.toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="ml-4 flex flex-col gap-2">
                    {request.status === 'pending' && (
                      <button
                        onClick={() => handleApprove(request._id, request.requestedAmount)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                      >
                        Approve
                      </button>
                    )}
                    <a
                      href={`/dashboard/welfare/requests/${request._id}`}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm text-center"
                    >
                      View Details
                    </a>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Contributions View</h3>
          <p className="text-gray-600">Contributions history coming soon</p>
        </div>
      )}
    </div>
  );
}

function RequestTypeBadge({ type }: { type: string }) {
  const labels: Record<string, string> = {
    bereavement: 'Bereavement',
    medical: 'Medical',
    wedding: 'Wedding',
    education: 'Education',
    emergency: 'Emergency',
    other: 'Other',
  };

  const colors: Record<string, string> = {
    bereavement: 'bg-gray-100 text-gray-800',
    medical: 'bg-red-100 text-red-800',
    wedding: 'bg-pink-100 text-pink-800',
    education: 'bg-blue-100 text-blue-800',
    emergency: 'bg-orange-100 text-orange-800',
    other: 'bg-gray-100 text-gray-800',
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${colors[type]}`}>
      {labels[type] || type}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    disbursed: 'bg-blue-100 text-blue-800',
  }[status];

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
