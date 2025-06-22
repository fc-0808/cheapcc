'use client';

import Link from 'next/link';
import { signup } from './actions';
import { useEffect, useState, useRef, Suspense } from 'react';
import ReCAPTCHA from "react-google-recaptcha";
import RegisterPageURLMessages from '@/components/RegisterPageURLMessages';
import GoogleSignInButton from '@/components/GoogleSignInButton';

export default function RegisterPage() {
  const [errorMessage, setErrorMessage] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  // --- New state for loading indicator ---
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password strength validation
  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  // Calculate overall password validity
  const isPasswordValid = Object.values(passwordRequirements).every(req => req);

  // Check if passwords match whenever either password changes
  useEffect(() => {
    if (confirmPasswordTouched) {
      setPasswordsMatch(password === confirmPassword);
    }
  }, [password, confirmPassword, confirmPasswordTouched]);

  // UPDATED useEffect for password strength calculation
  useEffect(() => {
    // Always calculate requirements based on the current password.
    // The display of these requirements in JSX is controlled by passwordTouched.
    setPasswordRequirements({
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[^a-zA-Z0-9]/.test(password),
    });
  }, [password]); // Only depends on password

  // Custom password input handler with validation
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (!passwordTouched) { // Ensure passwordTouched is set on first interaction
        setPasswordTouched(true);
    }
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

  const handleRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!recaptchaToken) {
      setErrorMessage("Please complete the reCAPTCHA.");
      return;
    }
    setErrorMessage('');
    setIsSubmitting(true); // --- Set loading state to true ---

    const formData = new FormData(event.currentTarget);
    formData.append('g-recaptcha-response', recaptchaToken);

    try {
      // The signup action will redirect on success or specific errors,
      // so the component might unmount.
      await signup(formData);
      // If signup action returns (e.g. on an unhandled error that doesn't redirect),
      // reset submitting state. Most of the time, redirect will prevent this.
      // No explicit error is returned to the client by the current `signup` action
      // if it doesn't redirect; it relies on redirects for all outcomes.
    } catch (error: any) {
        // This catch block might not be reached if `signup` always redirects
        // or if errors within server actions are handled differently by Next.js.
        // For robustness, ensure any client-displayable error from `signup` would be handled.
        // Currently, your `signup` action redirects on error.
        console.error("Client-side error during signup (should be rare if action redirects):", error);
        setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
        // This finally block might not execute as expected if a redirect happens.
        // However, if the signup action was to return an error object instead of redirecting,
        // this would be the place to set isSubmitting to false.
        // For now, the primary UX for loading is while waiting for the server action to complete.
        setIsSubmitting(false); // --- Reset loading state ---
        recaptchaRef.current?.reset();
        setRecaptchaToken(null);
    }
  };

  return (
    <main className="min-h-screen flex items-start sm:items-center justify-center bg-[#f8f9fa] pt-2 pb-4 px-4 sm:pt-4 sm:pb-6 overflow-y-auto">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-5 sm:p-6 mt-12 sm:mt-0 mb-2">
        <a href="/" className="w-fit mx-auto mb-2 sm:mb-3 logo text-3xl font-extrabold text-[#2c2d5a] tracking-tight flex items-center gap-2 hover:text-[#ff3366] transition" style={{fontFamily: 'Inter, Segoe UI, Arial, sans-serif', letterSpacing: '0.01em'}}>
          Cheap <span className="text-[#ff3366]">CC</span>
        </a>
        <h1 className="text-xl sm:text-2xl font-bold text-[#2c2d5a] mb-1 text-center">
          Create your account
        </h1>
        <p className="text-gray-500 text-center mb-2 sm:mb-3 text-sm">
          Join CheapCC and start saving on Adobe Creative Cloud
        </p>

        {/* Component to display messages from URL parameters */}
        <Suspense fallback={<div className="mb-3 p-2 rounded-md text-sm font-medium bg-gray-100">Loading messages...</div>}>
          <RegisterPageURLMessages />
        </Suspense>

        {/* Display client-side validation error messages */}
        {errorMessage && (
          <div className="mb-3 p-2 rounded-md text-sm font-medium bg-red-100 text-red-700">
            {errorMessage}
          </div>
        )}

        {/* Registration Form */}
        <form className="space-y-2 sm:space-y-3" onSubmit={handleSubmit}>
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
              disabled={isSubmitting} // --- Disable input when submitting ---
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
              disabled={isSubmitting} // --- Disable input when submitting ---
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
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#ff3366] transition text-[#2c2d5a] pr-10 ${passwordTouched && !isPasswordValid ? 'border-yellow-500 bg-yellow-50 focus:border-yellow-500' : 'border-gray-200 focus:border-[#ff3366]'}`}
                required
                disabled={isSubmitting} // --- Disable input when submitting ---
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-700 focus:outline-none"
                onClick={togglePasswordVisibility}
                disabled={isSubmitting} // --- Disable button when submitting ---
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
            
            {passwordTouched && (
              <div className="mt-1 text-xs">
                <div className="grid grid-cols-2 gap-x-2 gap-y-1">
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
                  <p className={passwordRequirements.hasNumber ? 'text-green-600' : 'text-gray-500'}>
                    <i className={`fas ${passwordRequirements.hasNumber ? 'fa-check-circle' : 'fa-circle'} mr-1`}></i>
                    One number
                  </p>
                  <p className={passwordRequirements.hasSpecialChar ? 'text-green-600' : 'text-gray-500'}>
                    <i className={`fas ${passwordRequirements.hasSpecialChar ? 'fa-check-circle' : 'fa-circle'} mr-1`}></i>
                    One special character
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
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#ff3366] transition text-[#2c2d5a] pr-10 ${!passwordsMatch && confirmPasswordTouched ? 'border-red-500 bg-red-50 focus:border-red-500' : 'border-gray-200 focus:border-[#ff3366]'}`}
                required
                disabled={isSubmitting} // --- Disable input when submitting ---
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-700 focus:outline-none"
                onClick={toggleConfirmPasswordVisibility}
                disabled={isSubmitting} // --- Disable button when submitting ---
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

          <div className="flex justify-center">
             <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                onChange={handleRecaptchaChange}
                // Note: ReCAPTCHA itself doesn't have a direct disabled prop in the same way.
                // The form submission will be blocked by the button's disabled state if isSubmitting.
              />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-gradient-to-r from-[#ff3366] to-[#ff5c86] text-white font-semibold rounded-md hover:from-[#ff2050] hover:to-[#ff4575] transition focus:ring-2 focus:ring-[#2c2d5a] focus:outline-none cursor-pointer disabled:opacity-60 shadow-md hover:shadow-lg hover:translate-y-[-1px]"
            disabled={isSubmitting || (confirmPasswordTouched && !passwordsMatch) || !isPasswordValid || !recaptchaToken}
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="relative my-3 sm:my-4">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">Or</span>
          </div>
        </div>
        <GoogleSignInButton />
        
        {/* Login Link */}
        <div className="text-center mt-3 sm:mt-4 text-sm text-gray-500">
          Already have an account?{' '}
          <Link
            href="/login"
            prefetch={false}
            className="text-[#ff3366] hover:underline font-medium"
          >
            Login
          </Link>
        </div>
      </div>
    </main>
  );
}
 