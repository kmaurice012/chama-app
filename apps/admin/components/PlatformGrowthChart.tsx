'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PlatformGrowthChartProps {
  data: {
    month: string;
    chamas: number;
    users: number;
  }[];
}

export default function PlatformGrowthChart({ data }: PlatformGrowthChartProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Platform Growth</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb' }} />
          <Legend />
          <Line type="monotone" dataKey="chamas" stroke="#8b5cf6" strokeWidth={2} name="Chamas" />
          <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} name="Users" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
