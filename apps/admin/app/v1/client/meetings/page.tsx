'use client';

import { useState, useEffect } from 'react';
import { Calendar, Plus, MapPin, Users, Clock } from 'lucide-react';

interface Meeting {
  _id: string;
  title: string;
  meetingType: 'regular' | 'emergency' | 'agm' | 'special';
  scheduledDate: string;
  scheduledTime: string;
  location?: string;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  attendance: any[];
  createdBy: any;
  createdAt: string;
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    fetchMeetings();
  }, [filter]);

  const fetchMeetings = async () => {
    try {
      const url = filter === 'upcoming' ? '/api/meetings?upcoming=true' : '/api/meetings';
      const res = await fetch(url);
      const data = await res.json();

      let filteredMeetings = data.meetings;
      if (filter === 'past') {
        filteredMeetings = data.meetings.filter(
          (m: Meeting) => new Date(m.scheduledDate) < new Date() && m.status === 'completed'
        );
      }

      setMeetings(filteredMeetings);
    } catch (error) {
      console.error('Error fetching meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  const upcomingCount = meetings.filter(
    (m) => new Date(m.scheduledDate) >= new Date() && ['scheduled', 'ongoing'].includes(m.status)
  ).length;

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
          <h2 className="text-3xl font-bold text-gray-900">Meetings</h2>
          <p className="text-gray-600 mt-2">Schedule and manage chama meetings</p>
        </div>
        <a
          href="/dashboard/meetings/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          <Plus className="w-5 h-5" />
          Schedule Meeting
        </a>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setFilter('upcoming')}
          className={`pb-3 px-2 font-medium transition ${
            filter === 'upcoming'
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Upcoming ({upcomingCount})
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`pb-3 px-2 font-medium transition ${
            filter === 'all'
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          All Meetings ({meetings.length})
        </button>
        <button
          onClick={() => setFilter('past')}
          className={`pb-3 px-2 font-medium transition ${
            filter === 'past'
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Past Meetings
        </button>
      </div>

      {/* Meetings List */}
      <div className="space-y-4">
        {meetings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No meetings found</h3>
            <p className="text-gray-600 mb-4">
              {filter === 'upcoming'
                ? 'No upcoming meetings scheduled'
                : 'No meetings have been created yet'}
            </p>
            <a
              href="/dashboard/meetings/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Plus className="w-5 h-5" />
              Schedule Meeting
            </a>
          </div>
        ) : (
          meetings.map((meeting) => (
            <div
              key={meeting._id}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{meeting.title}</h3>
                    <MeetingTypeBadge type={meeting.meetingType} />
                    <StatusBadge status={meeting.status} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(meeting.scheduledDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{meeting.scheduledTime}</span>
                    </div>
                    {meeting.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{meeting.location}</span>
                      </div>
                    )}
                  </div>

                  {meeting.status === 'scheduled' && (
                    <div className="mt-4 flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-600">
                        {meeting.attendance.filter((a: any) => a.status === 'present').length} /{' '}
                        {meeting.attendance.length} attended
                      </span>
                    </div>
                  )}
                </div>

                <a
                  href={`/dashboard/meetings/${meeting._id}`}
                  className="ml-4 px-4 py-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition"
                >
                  View Details
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function MeetingTypeBadge({ type }: { type: string }) {
  const colors = {
    regular: 'bg-blue-100 text-blue-800',
    emergency: 'bg-red-100 text-red-800',
    agm: 'bg-purple-100 text-purple-800',
    special: 'bg-yellow-100 text-yellow-800',
  }[type];

  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${colors}`}>
      {type.toUpperCase()}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors = {
    scheduled: 'bg-blue-100 text-blue-800',
    ongoing: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
  }[status];

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
