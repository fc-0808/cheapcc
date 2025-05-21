import React from 'react';
import Link from 'next/link';
import { login } from './actions';
import PasswordInput from '@/components/PasswordInput';

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f8f9fa] py-12 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <a href="/" className="w-fit mx-auto mb-6 logo text-3xl font-extrabold text-[#2c2d5a] tracking-tight flex items-center gap-2 hover:text-[#ff3366] transition" style={{fontFamily: 'Inter, Segoe UI, Arial, sans-serif', letterSpacing: '0.01em'}}>
          Cheap <span className="text-[#ff3366]">CC</span>
        </a>
        <h1 className="text-2xl font-bold text-[#2c2d5a] mb-2 text-center">Sign in to your account</h1>
        <p className="text-gray-500 text-center mb-6 text-sm">Welcome back! Please enter your details.</p>
        {/* Optionally, you can show a generic error if redirected to /error */}
        {/* You can add logic to show error messages based on search params or context */}
        <form className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#2c2d5a] mb-1">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#ff3366] focus:border-[#ff3366] transition text-[#2c2d5a]"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#2c2d5a] mb-1">Password</label>
            {/* Password input with show/hide toggle */}
            <PasswordInput />
          </div>
          <div className="flex gap-2">
          <button
              formAction={login}
              className="w-full py-2 px-4 bg-[#ff3366] text-white font-semibold rounded-md hover:bg-[#ff6b8b] transition focus:ring-2 focus:ring-[#2c2d5a] focus:outline-none"
            type="submit"
          >
              Sign In
          </button>
          </div>
        </form>
        <div className="text-center mt-6 text-sm text-gray-500">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-[#ff3366] hover:underline font-medium">Register</Link>
        </div>
      </div>
    </main>
  );
} 