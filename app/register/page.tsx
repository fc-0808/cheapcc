import Link from 'next/link';
import PasswordInput from '@/components/PasswordInput';
import { signup } from './actions';
import RegisterError from '@/components/RegisterError';

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f8f9fa] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-8 sm:p-10 space-y-6">
        {/* Logo Section */}
        <div className="flex justify-center">
          <a
            href="/"
            className="logo text-3xl sm:text-4xl font-extrabold text-[#2c2d5a] tracking-tight flex items-center gap-2 hover:text-[#ff3366] transition-colors duration-300"
            style={{
              fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
              letterSpacing: '0.01em',
            }}
          >
            Cheap
            <span className="text-[#ff3366]">CC</span>
          </a>
        </div>

        {/* Header Text */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2c2d5a] mb-2">
            Create your account
          </h1>
          <p className="text-gray-500 text-sm sm:text-base">
            Join CheapCC and start saving on Adobe Creative Cloud
          </p>
        </div>

        {/* Registration Form */}
        <form className="space-y-5" action={signup}>
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-[#2c2d5a] mb-1"
            >
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#ff3366] focus:border-[#ff3366] transition text-[#2c2d5a]"
              required
              placeholder="Your Full Name"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-[#2c2d5a] mb-1"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#ff3366] focus:border-[#ff3366] transition text-[#2c2d5a]"
              required
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[#2c2d5a] mb-1"
            >
              Password
            </label>
            <PasswordInput name="password" />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-[#2c2d5a] mb-1"
            >
              Confirm Password
            </label>
            <PasswordInput name="confirmPassword" />
          </div>

          {/* Error Message Display (client component) */}
          <RegisterError />

          <button
            type="submit"
            className="w-full py-3 px-4 bg-[#ff3366] text-white font-semibold rounded-lg hover:bg-[#e62e5c] transition-colors duration-300 focus:ring-4 focus:ring-[#ff3366]/50 focus:outline-none shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Create Account
          </button>
        </form>

        {/* Login Link */}
        <div className="text-center mt-6 text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-[#ff3366] hover:underline font-medium"
          >
            Login
          </Link>
        </div>
      </div>
    </main>
  );
}
