'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/supabase-client';
import { updatePassword } from './actions'; // Server action
import Link from 'next/link';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';

export default function UpdatePasswordPage() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | '' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSessionReady, setIsSessionReady] = useState(false); // To ensure user is in password recovery mode

  // State for password visibility
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password strength state (optional, for client-side UX)
  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });
  const isNewPasswordClientValid = Object.values(passwordRequirements).every(req => req);


  useEffect(() => {
    const error = searchParams.get('error');
    const success = searchParams.get('success'); // This would be set if redirected from login after successful reset
    if (error) {
      setMessage(decodeURIComponent(error));
      setMessageType('error');
      window.history.replaceState({}, document.title, '/auth/update-password');
    }
    if (success && success === 'password_reset_successful_redirect_from_action') { // A specific flag
        setMessage('Password updated successfully! You can now log in.');
        setMessageType('success');
        window.history.replaceState({}, document.title, '/auth/update-password');
        setTimeout(() => {
            router.push('/login?success=password_reset');
        }, 3000);
    }

    const { data: authListener } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsSessionReady(true);
        if (!message) { // Only set default message if no other message (like error) is present
          setMessage('You can now set your new password.');
          setMessageType('success'); // Or 'info'
        }
      }
    });

    // Initial check, Supabase SDK handles token from URL fragment
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
        // If user has a session and is in password recovery state (onAuthStateChange will handle)
        // If not, and no error messages from URL yet, it could be an invalid link.
        // The onAuthStateChange listener is the primary mechanism for PASSWORD_RECOVERY event.
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase, router, searchParams, message]); // Added message

  // Client-side password validation for UX
  useEffect(() => {
    setPasswordRequirements({
      minLength: newPassword.length >= 8,
      hasUppercase: /[A-Z]/.test(newPassword),
      hasLowercase: /[a-z]/.test(newPassword),
      hasNumber: /[0-9]/.test(newPassword),
      hasSpecialChar: /[^a-zA-Z0-9]/.test(newPassword),
    });
  }, [newPassword]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage('');
    setMessageType(null);

    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match.');
      setMessageType('error');
      setIsLoading(false);
      return;
    }
    if (!isNewPasswordClientValid) {
        setMessage('New password does not meet all requirements.');
        setMessageType('error');
        setIsLoading(false);
        return;
    }

    const formData = new FormData(event.currentTarget);
    // The server action `updatePassword` will handle the actual update
    // and will redirect on success or error.
    // We don't need to process a return value here if the action always redirects.
    await updatePassword(formData);

    // If the server action *didn't* redirect (e.g., if it returned an error object),
    // you would handle `result.error` here. But the current `updatePassword` action redirects.
    setIsLoading(false); // Reset loading state, though redirect might happen before this
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f8f9fa] py-12 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <a href="/" className="w-fit mx-auto mb-6 logo text-3xl font-extrabold text-[#2c2d5a] tracking-tight flex items-center gap-2 hover:text-[#ff3366] transition" style={{fontFamily: 'Inter, Segoe UI, Arial, sans-serif', letterSpacing: '0.01em'}}>
            Cheap <span className="text-[#ff3366]">CC</span>
        </a>
        <h1 className="text-2xl font-bold text-[#2c2d5a] mb-2 text-center">Set Your New Password</h1>

        {message && (
          <div className={`my-4 p-3 rounded-md text-sm font-medium ${
            messageType === 'success' ? 'bg-green-100 text-green-700' :
            messageType === 'error' ? 'bg-red-100 text-red-700' : ''
          }`}>
            {message}
          </div>
        )}

        {isSessionReady || searchParams.get('error') ? ( // Show form if in recovery mode or if there's an error message from a redirect
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="newPasswordAuthUpdate" className="block text-sm font-medium text-[#2c2d5a] mb-1">New Password</label>
              <div className="relative">
              <input
                  id="newPasswordAuthUpdate"
                  name="newPassword"
                  type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#ff3366] focus:border-[#ff3366] transition text-[#2c2d5a] pr-10"
                required
                placeholder="Enter new password"
              />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-700 focus:outline-none"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  <i className={`fas ${showNewPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                </button>
              </div>
            </div>
             {newPassword.length > 0 && ( // Show requirements only when user starts typing
                <div className="mt-2 text-xs space-y-0.5 text-gray-600">
                    <p className={passwordRequirements.minLength ? 'text-green-600' : 'text-red-500'}>• At least 8 characters</p>
                    <p className={passwordRequirements.hasUppercase ? 'text-green-600' : 'text-red-500'}>• At least one uppercase letter</p>
                    <p className={passwordRequirements.hasLowercase ? 'text-green-600' : 'text-red-500'}>• At least one lowercase letter</p>
                    <p className={passwordRequirements.hasNumber ? 'text-green-600' : 'text-red-500'}>• At least one number</p>
                    <p className={passwordRequirements.hasSpecialChar ? 'text-green-600' : 'text-red-500'}>• At least one special character</p>
                </div>
            )}
            <div>
              <label htmlFor="confirmPasswordAuthUpdate" className="block text-sm font-medium text-[#2c2d5a] mb-1">Confirm New Password</label>
              <div className="relative">
              <input
                  id="confirmPasswordAuthUpdate"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#ff3366] focus:border-[#ff3366] transition text-[#2c2d5a] pr-10"
                required
                placeholder="Confirm new password"
              />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-700 focus:outline-none"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <i className={`fas ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                </button>
              </div>
            </div>
             {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                <p className="text-xs text-red-500">Passwords do not match.</p>
            )}
            <div>
              <button
                type="submit"
                disabled={isLoading || !isNewPasswordClientValid || (newPassword !== confirmPassword && confirmPassword.length > 0) }
                className="w-full py-2 px-4 bg-[#ff3366] text-white font-semibold rounded-md hover:bg-[#ff6b8b] transition focus:ring-2 focus:ring-[#2c2d5a] focus:outline-none cursor-pointer disabled:opacity-50"
              >
                {isLoading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        ) : (
          !message && <p className="text-center text-gray-500 py-4">Verifying reset link or session...</p>
        )}
         <div className="text-center mt-6 text-sm text-gray-500">
            Back to{' '}
            <Link href="/login" legacyBehavior={false} className="text-[#ff3366] hover:underline font-medium">
                Log In
            </Link>
        </div>
      </div>
    </main>
  );
} 