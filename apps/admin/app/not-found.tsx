'use client';

import Link from 'next/link';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-100 rounded-full mb-6">
            <FileQuestion className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">Page Not Found</h2>
          <p className="text-lg text-gray-600 mb-8">
            Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
          >
            <Home className="w-5 h-5" />
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-lg font-semibold hover:border-gray-400 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>

        <div className="mt-12 p-6 bg-white rounded-xl shadow-md">
          <h3 className="font-semibold text-gray-900 mb-3">Looking for something?</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>
              <Link href="/auth/login" className="text-blue-600 hover:underline">
                Login to your account
              </Link>
            </li>
            <li>
              <Link href="/auth/register" className="text-blue-600 hover:underline">
                Register a new chama
              </Link>
            </li>
            <li>
              <Link href="/#features" className="text-blue-600 hover:underline">
                View our features
              </Link>
            </li>
            <li>
              <Link href="/#contact" className="text-blue-600 hover:underline">
                Contact support
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
