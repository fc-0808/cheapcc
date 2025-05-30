'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/supabase-client';
import { updatePassword } from './actions'; // Server action
import Link from 'next/link';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';
import UpdatePasswordMessages from '@/components/UpdatePasswordMessages';

export default function UpdatePasswordPage() {
  const supabase = createClient();
  const router = useRouter();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSessionReady, setIsSessionReady] = useState(false); // Controls form display
  const [pageMessage, setPageMessage] = useState<string | null>(null);
  const [pageMessageType, setPageMessageType] = useState<'error' | 'info' | null>(null);

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

  // Effect for Supabase auth state changes, including PASSWORD_RECOVERY event
  useEffect(() => {
    let mounted = true;
    let verifTimeoutId: NodeJS.Timeout | null = null;
    console.log('UpdatePasswordPage: useEffect for auth state change mounted.');

    const { data: authListener } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      if (!mounted) return;
      console.log(`UpdatePasswordPage: Auth event: ${event}`, session ? `Session User ID: ${session.user?.id?.substring(0,5)}` : 'No session');

      if (event === "PASSWORD_RECOVERY") {
        console.log("UpdatePasswordPage: PASSWORD_RECOVERY event received. Session is active for password update.");
        if (verifTimeoutId) clearTimeout(verifTimeoutId);
        setPageMessage(null);
        setPageMessageType(null);
        setIsSessionReady(true);
      } else if (event === "INITIAL_SESSION" && !session) {
         // This might happen if the link is bad or already used.
         // The fragment check below will set an error earlier if no fragment.
         console.log("UpdatePasswordPage: INITIAL_SESSION with no session. Waiting for fragment processing or timeout.");
      } else if (event === "SIGNED_IN" && session && typeof window !== 'undefined' && !window.location.hash.includes('type=recovery')) {
        // This means user is already signed in normally, not via recovery.
        // This page is not for normally signed-in users to change password (that's on /profile)
        console.log("UpdatePasswordPage: User is already signed in (not recovery). Showing info message.");
        setPageMessage("This page is for password recovery. To change your password while logged in, please go to your profile page.");
        setPageMessageType("info");
        setIsSessionReady(false); // Form should not be shown
        if (verifTimeoutId) clearTimeout(verifTimeoutId); // Clear timeout if user is already signed in
      }
      // Other events like SIGNED_OUT or TOKEN_REFRESHED might occur, but they don't necessarily
      // mean the recovery flow failed unless they happen *instead* of PASSWORD_RECOVERY
      // when a recovery token is expected. The timeout helps catch cases where PASSWORD_RECOVERY is missed.
    });

    // Check for fragment immediately. Supabase client also does this, but this provides quicker UI feedback.
    // The PASSWORD_RECOVERY event is the ultimate confirmation.
    if (typeof window !== 'undefined') {
      if (!window.location.hash.includes('type=recovery') || !window.location.hash.includes('access_token')) {
        console.warn("UpdatePasswordPage: No valid recovery fragment in URL on mount. Link may be invalid or already used.");
        setPageMessage("Invalid or expired password reset link. Please request a new one if needed.");
        setPageMessageType("error");
        setIsSessionReady(false); // Form should not be shown
      } else {
        // Fragment exists, set a timeout to display an error if PASSWORD_RECOVERY event isn't received.
        verifTimeoutId = setTimeout(() => {
          if (mounted && !isSessionReady) {
            console.warn("UpdatePasswordPage: Timeout reached, PASSWORD_RECOVERY event not detected despite fragment. Possible issue with token or Supabase client processing.");
            setPageMessage("Failed to verify password reset link. It might be expired, already used, or there was an issue processing it. Please try requesting a reset again.");
            setPageMessageType("error");
            // isSessionReady remains false
          }
        }, 7000); // 7 seconds timeout
      }
    }

    return () => {
      mounted = false;
      if (verifTimeoutId) clearTimeout(verifTimeoutId);
      console.log('UpdatePasswordPage: Unsubscribing from auth state changes.');
      authListener.subscription.unsubscribe();
    };
  }, [supabase]); // Only supabase as dependency

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

    setPageMessage(null); // Clear previous messages
    setPageMessageType(null);

    if (newPassword !== confirmPassword) {
      setPageMessage("Passwords do not match.");
      setPageMessageType("error");
      return;
    }
    if (!isNewPasswordClientValid) {
      setPageMessage("Password does not meet all requirements.");
      setPageMessageType("error");
      return;
    }

    setIsLoading(true);
    const formData = new FormData(event.currentTarget);
    // Server action `updatePassword` will handle actual submission and redirects.
    // Errors from it will appear as URL parameters, handled by UpdatePasswordMessages.
    // Client-side errors are handled by pageMessage.
    try {
        await updatePassword(formData);
        // If updatePassword does not redirect (e.g. returns an error object - though current one redirects),
        // then we'd handle its return value here.
        // For now, we assume it redirects on success/error.
    } catch (e) {
        // This catch is for client-side errors during the call, less likely.
        console.error("Client-side error calling updatePassword action:", e);
        setPageMessage("An unexpected client-side error occurred.");
        setPageMessageType("error");
    } finally {
        setIsLoading(false); // Ensure loading state is reset if catch is hit or if server action didn't redirect (unlikely)
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f8f9fa] py-12 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <a href="/" className="w-fit mx-auto mb-6 logo text-3xl font-extrabold text-[#2c2d5a] tracking-tight flex items-center gap-2 hover:text-[#ff3366] transition" style={{fontFamily: 'Inter, Segoe UI, Arial, sans-serif', letterSpacing: '0.01em'}}>
            Cheap <span className="text-[#ff3366]">CC</span>
        </a>
        <h1 className="text-2xl font-bold text-[#2c2d5a] mb-2 text-center">Set Your New Password</h1>

        {/* Component for messages from URL parameters */}
        <Suspense fallback={<div className="my-4 p-3 rounded-md text-sm font-medium bg-gray-100 text-gray-700">Loading messages...</div>}>
          <UpdatePasswordMessages />
        </Suspense>

        {/* For client-side messages */}
        {pageMessage && (
          <div className={`my-4 p-3 rounded-md text-sm font-medium ${
            pageMessageType === 'error' ? 'bg-red-100 text-red-700' :
            pageMessageType === 'info' ? 'bg-blue-100 text-blue-700' : ''
          }`}>
            {pageMessage}
          </div>
        )}

        {isSessionReady && !pageMessage && ( // Only show form if session is ready AND no overriding page error
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
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-700 focus:outline-none"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                  disabled={isLoading}
                >
                  <i className={`fas ${showNewPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                </button>
              </div>
            </div>
            {newPassword.length > 0 && (
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
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-700 focus:outline-none"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show new password"}
                  disabled={isLoading}
                >
                  <i className={`fas ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                </button>
              </div>
            </div>
            {newPassword.length > 0 && confirmPassword.length > 0 && newPassword !== confirmPassword && (
              <p className="text-xs text-red-500 -mt-3">Passwords do not match.</p>
            )}
            <div>
              <button
                type="submit"
                disabled={isLoading || !isNewPasswordClientValid || (newPassword.length > 0 && newPassword !== confirmPassword) }
                className="w-full py-2 px-4 bg-[#ff3366] text-white font-semibold rounded-md hover:bg-[#ff6b8b] transition focus:ring-2 focus:ring-[#2c2d5a] focus:outline-none cursor-pointer disabled:opacity-50"
              >
                {isLoading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        )}

        {!isSessionReady && !pageMessage && ( // Show verifying message only if no error has been set yet and session isn't ready
           <p className="text-center text-gray-500 py-4">Verifying reset link or session...</p>
        )}

        <div className="text-center mt-6 text-sm text-gray-500">
          Back to{' '}
          <Link href="/login" className="text-[#ff3366] hover:underline font-medium">
              Log In
          </Link>
        </div>
      </div>
    </main>
  );
} 