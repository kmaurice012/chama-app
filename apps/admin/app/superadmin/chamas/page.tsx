'use client';

import { useState, useEffect } from 'react';
import { Search, Eye, Ban, CheckCircle, Calendar, Users } from 'lucide-react';

interface Chama {
  _id: string;
  name: string;
  description?: string;
  contributionAmount: number;
  contributionFrequency: string;
  totalMembers: number;
  totalSavings: number;
  totalLoans: number;
  adminCount: number;
  memberCount: number;
  isActive: boolean;
  createdAt: string;
}

export default function SuperAdminChamasPage() {
  const [chamas, setChamas] = useState<Chama[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchChamas();
  }, []);

  const fetchChamas = async () => {
    try {
      const response = await fetch('/api/superadmin/chamas');
      const data = await response.json();
      setChamas(data.chamas);
    } catch (error) {
      console.error('Error fetching chamas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredChamas = chamas.filter((chama) => {
    const matchesSearch = chama.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && chama.isActive) ||
      (filterStatus === 'inactive' && !chama.isActive);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">All Chamas</h2>
        <p className="text-gray-600 mt-2">
          Manage and monitor all chamas on the platform
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search chamas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-sm text-gray-600">Total Chamas</div>
          <div className="text-2xl font-bold text-gray-900">{chamas.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-sm text-gray-600">Active Chamas</div>
          <div className="text-2xl font-bold text-green-600">
            {chamas.filter((c) => c.isActive).length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-sm text-gray-600">Total Members</div>
          <div className="text-2xl font-bold text-blue-600">
            {chamas.reduce((sum, c) => sum + c.memberCount, 0)}
          </div>
        </div>
      </div>

      {/* Chamas List */}
      {isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="grid gap-6">
          {filteredChamas.map((chama) => (
            <div
              key={chama._id}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {chama.name}
                    </h3>
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        chama.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {chama.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {chama.description && (
                    <p className="text-gray-600 mb-4">{chama.description}</p>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Members</p>
                      <p className="text-lg font-semibold text-gray-900 flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {chama.memberCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Contribution</p>
                      <p className="text-lg font-semibold text-gray-900">
                        KES {chama.contributionAmount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Savings</p>
                      <p className="text-lg font-semibold text-green-600">
                        KES {chama.totalSavings.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Loans</p>
                      <p className="text-lg font-semibold text-purple-600">
                        KES {chama.totalLoans.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Joined: {new Date(chama.createdAt).toLocaleDateString()}
                    </div>
                    <div>
                      Frequency: <span className="capitalize">{chama.contributionFrequency}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {chama.isActive ? (
                    <button
                      className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700"
                      title="Deactivate"
                    >
                      <Ban className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700"
                      title="Activate"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredChamas.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No chamas found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
