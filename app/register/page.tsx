'use client';
import Link from 'next/link';
import { signup } from './actions';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password strength validation
  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false
  });

  // Calculate overall password validity
  const isPasswordValid = Object.values(passwordRequirements).every(req => req);

  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      setErrorMessage(decodeURIComponent(error));
      window.history.replaceState({}, document.title, '/register');
    }
  }, [searchParams]);

  // Check if passwords match whenever either password changes
  useEffect(() => {
    if (confirmPasswordTouched) {
      setPasswordsMatch(password === confirmPassword);
    }
  }, [password, confirmPassword, confirmPasswordTouched]);

  // Validate password strength
  useEffect(() => {
    if (passwordTouched) {
      setPasswordRequirements({
        minLength: password.length >= 8,
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password)
      });
    }
  }, [password, passwordTouched]);

  // Custom password input handler with validation
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setPasswordTouched(true);
  };

  // Custom confirm password input handler with validation
  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    setConfirmPasswordTouched(true);
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Toggle confirm password visibility
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f8f9fa] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-8 sm:p-10 space-y-6">
        {/* Logo Section */}
        <div className="flex justify-center">
          <a
            href="/"
            className="logo text-3xl font-extrabold text-[#2c2d5a] tracking-tight flex items-center gap-2 hover:text-[#ff3366] transition"
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
          <h1 className="text-2xl font-bold text-[#2c2d5a] mb-2">
            Create your account
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            Join CheapCC and start saving on Adobe Creative Cloud
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-md text-sm font-medium bg-red-100 text-red-700">
            {errorMessage}
          </div>
        )}

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
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={password}
                onChange={handlePasswordChange}
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#ff3366] transition text-[#2c2d5a] pr-10 ${passwordTouched && !isPasswordValid ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200'}`}
                required
              />
              <button 
                type="button" 
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-700 focus:outline-none"
                onClick={togglePasswordVisibility}
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
            
            {passwordTouched && (
              <div className="mt-2 text-sm space-y-1">
                <p className="font-medium text-gray-700">Password must contain:</p>
                <div className="flex flex-col gap-1">
                  <p className={passwordRequirements.minLength ? 'text-green-600' : 'text-gray-500'}>
                    <i className={`fas ${passwordRequirements.minLength ? 'fa-check-circle' : 'fa-circle'} mr-1`}></i>
                    At least 8 characters
                  </p>
                  <p className={passwordRequirements.hasUppercase ? 'text-green-600' : 'text-gray-500'}>
                    <i className={`fas ${passwordRequirements.hasUppercase ? 'fa-check-circle' : 'fa-circle'} mr-1`}></i>
                    One uppercase letter
                  </p>
                  <p className={passwordRequirements.hasLowercase ? 'text-green-600' : 'text-gray-500'}>
                    <i className={`fas ${passwordRequirements.hasLowercase ? 'fa-check-circle' : 'fa-circle'} mr-1`}></i>
                    One lowercase letter
                  </p>
                </div>
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-[#2c2d5a] mb-1"
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#ff3366] transition text-[#2c2d5a] pr-10 ${!passwordsMatch && confirmPasswordTouched ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                required
              />
              <button 
                type="button" 
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-700 focus:outline-none"
                onClick={toggleConfirmPasswordVisibility}
              >
                <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
            {!passwordsMatch && confirmPasswordTouched && (
              <p className="mt-1 text-sm text-red-600">
                <i className="fas fa-exclamation-circle mr-1"></i>
                Passwords don't match
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-[#ff3366] text-white font-semibold rounded-lg hover:bg-[#e62e5c] transition-colors duration-300 focus:ring-4 focus:ring-[#ff3366]/50 focus:outline-none shadow-md hover:shadow-lg transform hover:-translate-y-0.5 cursor-pointer"
            disabled={(confirmPasswordTouched && !passwordsMatch) || !isPasswordValid}
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
 