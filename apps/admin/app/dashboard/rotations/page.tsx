'use client';

import { useState, useEffect } from 'react';
import { Repeat, Plus, Users, Calendar, DollarSign } from 'lucide-react';

interface RotationCycle {
  _id: string;
  cycleNumber: number;
  startDate: string;
  endDate: string;
  contributionAmount: number;
  status: 'active' | 'completed' | 'cancelled';
  rotationOrder: any[];
  currentRecipientIndex: number;
  totalContributions: number;
  createdAt: string;
}

export default function RotationsPage() {
  const [cycles, setCycles] = useState<RotationCycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchRotations();
  }, []);

  const fetchRotations = async () => {
    try {
      const res = await fetch('/api/rotations');
      const data = await res.json();
      setCycles(data.cycles);
    } catch (error) {
      console.error('Error fetching rotations:', error);
    } finally {
      setLoading(false);
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
          <h2 className="text-3xl font-bold text-gray-900">Merry-Go-Round Cycles</h2>
          <p className="text-gray-600 mt-2">Manage rotation cycles and distributions</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          <Plus className="w-5 h-5" />
          Create Cycle
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Cycles"
          value={cycles.length}
          icon={<Repeat className="w-6 h-6" />}
          color="teal"
        />
        <StatCard
          title="Active Cycles"
          value={cycles.filter((c) => c.status === 'active').length}
          icon={<Calendar className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Completed Cycles"
          value={cycles.filter((c) => c.status === 'completed').length}
          icon={<DollarSign className="w-6 h-6" />}
          color="green"
        />
      </div>

      {/* Cycles List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Rotation Cycles</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {cycles.length === 0 ? (
            <div className="p-12 text-center">
              <Repeat className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No rotation cycles yet</h3>
              <p className="text-gray-600 mb-4">
                Create your first merry-go-round cycle to start rotating funds among members
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                <Plus className="w-5 h-5" />
                Create Cycle
              </button>
            </div>
          ) : (
            cycles.map((cycle) => (
              <div key={cycle._id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">
                        Cycle #{cycle.cycleNumber}
                      </h4>
                      <StatusBadge status={cycle.status} />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Members</p>
                        <p className="font-semibold text-gray-900">
                          {cycle.rotationOrder.length}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Contribution</p>
                        <p className="font-semibold text-gray-900">
                          KES {cycle.contributionAmount.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Current Recipient</p>
                        <p className="font-semibold text-gray-900">
                          {cycle.currentRecipientIndex + 1} of {cycle.rotationOrder.length}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Total Collected</p>
                        <p className="font-semibold text-gray-900">
                          KES {cycle.totalContributions.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-gray-600">
                      {new Date(cycle.startDate).toLocaleDateString()} -{' '}
                      {new Date(cycle.endDate).toLocaleDateString()}
                    </div>
                  </div>
                  <a
                    href={`/dashboard/rotations/${cycle._id}`}
                    className="ml-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                  >
                    View Details
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Modal would go here */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Create Rotation Cycle</h3>
            <p className="text-gray-600 mb-4">
              Feature coming soon! This will allow you to create a new merry-go-round cycle with
              custom member rotation order.
            </p>
            <button
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  const colorClasses = {
    teal: 'bg-teal-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
  }[color];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`${colorClasses} text-white p-3 rounded-lg`}>{icon}</div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors = {
    active: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
  }[status];

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
