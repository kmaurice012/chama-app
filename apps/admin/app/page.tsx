import Link from 'next/link';
import {
  Users,
  DollarSign,
  TrendingUp,
  Shield,
  Calendar,
  Heart,
  CheckCircle,
  ArrowRight,
  Repeat,
  AlertCircle,
  FileText,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-green-500 to-blue-600 text-white rounded-lg p-2">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                ChamaHub
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition">How It Works</a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition">Testimonials</a>
              <a href="#contact" className="text-gray-600 hover:text-gray-900 transition">Contact</a>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/auth/login"
                className="text-gray-600 hover:text-gray-900 font-medium transition"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-block">
                <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                  🇰🇪 Built for Kenyan Chamas
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                Manage Your Chama
                <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"> Digitally</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                The complete platform to manage contributions, loans, merry-go-rounds, meetings,
                and welfare funds. Simplify your chama operations and focus on growth.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/auth/register"
                  className="px-8 py-4 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-xl transition flex items-center justify-center gap-2"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/auth/login"
                  className="px-8 py-4 bg-white text-gray-700 border-2 border-gray-300 rounded-lg font-semibold hover:border-gray-400 transition flex items-center justify-center gap-2"
                >
                  View Demo
                </Link>
              </div>
              <div className="flex items-center gap-8 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-600">No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-600">Setup in 5 minutes</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 transform hover:scale-105 transition duration-300">
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-500 p-2 rounded-lg">
                        <DollarSign className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Contributions</p>
                        <p className="text-xl font-bold text-gray-900">KES 2,450,000</p>
                      </div>
                    </div>
                    <span className="text-green-600 text-sm font-semibold">+12%</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-500 p-2 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Active Loans</p>
                        <p className="text-xl font-bold text-gray-900">42 Loans</p>
                      </div>
                    </div>
                    <span className="text-blue-600 text-sm font-semibold">KES 850K</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-500 p-2 rounded-lg">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Active Members</p>
                        <p className="text-xl font-bold text-gray-900">156 Members</p>
                      </div>
                    </div>
                    <span className="text-purple-600 text-sm font-semibold">98% Active</span>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br from-green-400 to-blue-500 rounded-full blur-3xl opacity-30"></div>
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full blur-3xl opacity-30"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything Your Chama Needs
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From contributions to welfare funds, we've built features that mirror real chama operations in Kenya
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Users className="w-8 h-8" />}
              title="Member Management"
              description="Easily onboard members, track their profiles, and manage roles with admin and member portals."
              gradient="from-green-500 to-emerald-600"
            />
            <FeatureCard
              icon={<DollarSign className="w-8 h-8" />}
              title="Contribution Tracking"
              description="Record monthly contributions, track payment history, and generate comprehensive financial reports."
              gradient="from-blue-500 to-cyan-600"
            />
            <FeatureCard
              icon={<TrendingUp className="w-8 h-8" />}
              title="Loan Management"
              description="Process loan requests, manage guarantors, track repayments with interest calculations, and monitor defaults."
              gradient="from-purple-500 to-pink-600"
            />
            <FeatureCard
              icon={<Repeat className="w-8 h-8" />}
              title="Merry-Go-Round"
              description="Automate rotation cycles, distribute funds fairly, and track each member's turn in the rotation."
              gradient="from-orange-500 to-red-600"
            />
            <FeatureCard
              icon={<Calendar className="w-8 h-8" />}
              title="Meeting Management"
              description="Schedule meetings, track attendance, record minutes, and send reminders to all members automatically."
              gradient="from-indigo-500 to-blue-600"
            />
            <FeatureCard
              icon={<AlertCircle className="w-8 h-8" />}
              title="Fines & Penalties"
              description="Issue fines for late contributions or missed meetings, track payments, and manage waivers with transparency."
              gradient="from-red-500 to-rose-600"
            />
            <FeatureCard
              icon={<Heart className="w-8 h-8" />}
              title="Welfare Fund"
              description="Manage welfare contributions, process emergency requests, and support members during medical or bereavement needs."
              gradient="from-pink-500 to-rose-600"
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8" />}
              title="Secure & Private"
              description="Bank-level security with role-based access. Members only see their own data, admins manage everything."
              gradient="from-gray-700 to-gray-900"
            />
            <FeatureCard
              icon={<FileText className="w-8 h-8" />}
              title="Reports & Analytics"
              description="Generate detailed financial reports, member summaries, and gain insights into your chama's performance."
              gradient="from-teal-500 to-green-600"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Get Started in 3 Simple Steps
            </h2>
            <p className="text-xl text-gray-600">
              Launch your digital chama in minutes, not hours
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <StepCard
              number="1"
              title="Register Your Chama"
              description="Sign up with your chama details including name, location, contribution rules, and loan policies. Set up your admin account."
              icon={<Users className="w-12 h-12" />}
            />
            <StepCard
              number="2"
              title="Add Your Members"
              description="Invite members via email or add them manually. Each member gets their own secure login to track their contributions and loans."
              icon={<DollarSign className="w-12 h-12" />}
            />
            <StepCard
              number="3"
              title="Start Managing"
              description="Record contributions, approve loans, schedule meetings, and manage all chama activities from one powerful dashboard."
              icon={<TrendingUp className="w-12 h-12" />}
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Trusted by Chamas Across Kenya
            </h2>
            <p className="text-xl text-gray-600">
              See what chama leaders are saying about ChamaHub
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard
              quote="ChamaHub transformed how we manage our chama. No more Excel spreadsheets or lost records. Everything is transparent and accessible to all members."
              author="Mary Wanjiku"
              role="Chairlady, Nairobi Women Investment Group"
              initials="MW"
            />
            <TestimonialCard
              quote="The loan management feature with guarantor tracking is a game-changer. We've reduced defaults by 40% since we can track everything properly."
              author="John Kamau"
              role="Treasurer, Kiambu Business Chama"
              initials="JK"
            />
            <TestimonialCard
              quote="Our members love that they can check their contributions and loan status anytime on their phones. It has improved trust and participation."
              author="Grace Akinyi"
              role="Secretary, Kisumu Unity Chama"
              initials="GA"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-green-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Digitize Your Chama?
          </h2>
          <p className="text-xl text-green-50 mb-8">
            Join hundreds of chamas already using ChamaHub to manage their operations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="px-8 py-4 bg-white text-green-600 rounded-lg font-semibold hover:shadow-xl transition inline-flex items-center justify-center gap-2"
            >
              Start Your Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="#contact"
              className="px-8 py-4 bg-transparent text-white border-2 border-white rounded-lg font-semibold hover:bg-white/10 transition"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Get in Touch
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Have questions? We're here to help you get started with ChamaHub
              </p>
              <div className="space-y-6">
                <ContactInfo
                  icon={<Phone className="w-6 h-6" />}
                  label="Phone"
                  value="+254 712 345 678"
                />
                <ContactInfo
                  icon={<Mail className="w-6 h-6" />}
                  label="Email"
                  value="support@chamahub.co.ke"
                />
                <ContactInfo
                  icon={<MapPin className="w-6 h-6" />}
                  label="Location"
                  value="Nairobi, Kenya"
                />
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Tell us about your chama..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-gradient-to-br from-green-500 to-blue-600 text-white rounded-lg p-2">
                  <Users className="w-6 h-6" />
                </div>
                <span className="text-xl font-bold text-white">ChamaHub</span>
              </div>
              <p className="text-sm">
                The modern way to manage your chama. Built with love in Kenya, for Kenyan chamas.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition">How It Works</a></li>
                <li><a href="/auth/register" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#testimonials" className="hover:text-white transition">Testimonials</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">About Us</a></li>
                <li><a href="#contact" className="hover:text-white transition">Contact</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2025 ChamaHub. All rights reserved. Made with ❤️ in Kenya</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  gradient
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <div className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition duration-300 border border-gray-100">
      <div className={`inline-block p-3 bg-gradient-to-r ${gradient} rounded-xl mb-4 group-hover:scale-110 transition`}>
        <div className="text-white">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
  icon
}: {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="relative">
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-600 rounded-full blur-xl opacity-30"></div>
          <div className="relative bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-full w-20 h-20 flex items-center justify-center text-3xl font-bold">
            {number}
          </div>
        </div>
        <div className="mb-4 text-gray-400">
          {icon}
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function TestimonialCard({
  quote,
  author,
  role,
  initials
}: {
  quote: string;
  author: string;
  role: string;
  initials: string;
}) {
  return (
    <div className="p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
      <div className="flex items-center gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <span key={i} className="text-yellow-400 text-xl">★</span>
        ))}
      </div>
      <p className="text-gray-700 mb-6 leading-relaxed italic">"{quote}"</p>
      <div className="flex items-center gap-4">
        <div className="bg-gradient-to-br from-green-500 to-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold">
          {initials}
        </div>
        <div>
          <p className="font-semibold text-gray-900">{author}</p>
          <p className="text-sm text-gray-600">{role}</p>
        </div>
      </div>
    </div>
  );
}

function ContactInfo({
  icon,
  label,
  value
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white p-3 rounded-lg">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-600 mb-1">{label}</p>
        <p className="text-lg font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
