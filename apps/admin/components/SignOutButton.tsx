'use client';

import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';
import { useState } from 'react';

interface SignOutButtonProps {
  variant?: 'default' | 'white';
}

export default function SignOutButton({ variant = 'default' }: SignOutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut({ callbackUrl: '/auth/login', redirect: true });
    } catch (error) {
      console.error('Sign out error:', error);
      setIsLoading(false);
    }
  };

  const colorClasses = variant === 'white'
    ? 'text-white hover:text-purple-100'
    : 'text-gray-600 hover:text-gray-900';

  return (
    <button
      onClick={handleSignOut}
      disabled={isLoading}
      className={`flex items-center gap-2 ${colorClasses} disabled:opacity-50 disabled:cursor-not-allowed transition`}
    >
      <LogOut className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
      {isLoading ? 'Signing out...' : 'Logout'}
    </button>
  );
}
