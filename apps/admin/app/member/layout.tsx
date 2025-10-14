import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import { Home, DollarSign, TrendingUp, User, LogOut, AlertCircle, Heart } from 'lucide-react';

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  // Redirect admins and superadmins to their dashboards
  if (session.user.role === 'admin') {
    redirect('/dashboard');
  }

  if (session.user.role === 'superadmin') {
    redirect('/superadmin');
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
                Welcome, {session.user.name}
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
              <NavLink href="/member" icon={<Home />} label="Dashboard" />
              <NavLink href="/member/contributions" icon={<DollarSign />} label="My Contributions" />
              <NavLink href="/member/loans" icon={<TrendingUp />} label="My Loans" />
              <NavLink href="/member/fines" icon={<AlertCircle />} label="My Fines" />
              <NavLink href="/member/welfare" icon={<Heart />} label="Welfare" />
              <NavLink href="/member/profile" icon={<User />} label="Profile" />
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
