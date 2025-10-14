import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import { Users, DollarSign, TrendingUp, FileText, LogOut, Settings, Calendar, AlertCircle, Repeat, Heart } from 'lucide-react';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {session.user.chamaName}
              </h1>
              <p className="text-sm text-gray-600">
                Welcome, {session.user.name} ({session.user.role})
              </p>
            </div>
            <Link
              href="/api/auth/signout"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <aside className="w-64 flex-shrink-0">
            <nav className="bg-white rounded-lg shadow-sm p-4 space-y-2">
              <NavLink href="/v1/client" icon={<TrendingUp />} label="Dashboard" />
              <NavLink href="/v1/client/members" icon={<Users />} label="Members" />
              <NavLink href="/v1/client/contributions" icon={<DollarSign />} label="Contributions" />
              <NavLink href="/v1/client/loans" icon={<FileText />} label="Loans" />
              <NavLink href="/v1/client/rotations" icon={<Repeat />} label="Merry-Go-Round" />
              <NavLink href="/v1/client/meetings" icon={<Calendar />} label="Meetings" />
              <NavLink href="/v1/client/fines" icon={<AlertCircle />} label="Fines" />
              <NavLink href="/v1/client/welfare" icon={<Heart />} label="Welfare" />
              <NavLink href="/v1/client/settings" icon={<Settings />} label="Settings" />
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}

function NavLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-700 rounded-lg transition"
    >
      <span className="w-5 h-5">{icon}</span>
      <span className="font-medium">{label}</span>
    </Link>
  );
}
