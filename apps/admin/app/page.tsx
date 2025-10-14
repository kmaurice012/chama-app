import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-green-50 to-blue-50">
      <div className="text-center space-y-8">
        <h1 className="text-6xl font-bold text-gray-900">
          Chama Manager
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl">
          Digitize your chama operations. Track contributions, manage loans, and grow together.
        </p>

        <div className="flex gap-4 justify-center mt-8">
          <Link
            href="/auth/login"
            className="px-8 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition"
          >
            Login
          </Link>
          <Link
            href="/auth/register"
            className="px-8 py-3 bg-white text-primary-600 border-2 border-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition"
          >
            Register
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <FeatureCard
            title="Member Management"
            description="Easily add and manage all your chama members"
          />
          <FeatureCard
            title="Track Contributions"
            description="Monitor monthly contributions and payment history"
          />
          <FeatureCard
            title="Loan Management"
            description="Handle loan requests and track repayments"
          />
        </div>
      </div>
    </main>
  )
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}
