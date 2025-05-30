'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/supabase-client';
import { updatePassword } from './actions';
import Link from 'next/link';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';
import UpdatePasswordMessages from '@/components/UpdatePasswordMessages';

export default function UpdatePasswordPage() {
  const supabase = createClient();
  const router = useRouter();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'ready' | 'error' | 'info'>('verifying');
  const [pageMessage, setPageMessage] = useState<string | null>(null);

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });
  const isNewPasswordClientValid = Object.values(passwordRequirements).every(req => req);

  useEffect(() => {
    let mounted = true;
    let verificationTimeoutId: NodeJS.Timeout | null = null;
    console.log('UpdatePasswordPage: useEffect for auth state change mounted.');

    const { data: authListener } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      if (!mounted) return;
      console.log(`UpdatePasswordPage: Auth event: ${event}`, session ? `User ID: ${session.user?.id?.substring(0,5)}` : 'No session');

      if (event === "PASSWORD_RECOVERY") {
        console.log("UpdatePasswordPage: PASSWORD_RECOVERY event. Ready to update password.");
        if (verificationTimeoutId) clearTimeout(verificationTimeoutId);
        setVerificationStatus('ready');
        setPageMessage(null);
      } else if (event === "SIGNED_IN" && session && verificationStatus !== 'ready') {
        // This case handles if a user is already fully signed in and navigates here.
        console.log("UpdatePasswordPage: User is SIGNED_IN (not via PASSWORD_RECOVERY for this page).");
        setVerificationStatus('info');
        setPageMessage("This page is for password recovery. To change your password while logged in, please go to your profile page.");
      } else if ((event === "INITIAL_SESSION" && !session) || event === "SIGNED_OUT") {
        if (verificationStatus === 'verifying' && typeof window !== 'undefined' && !window.location.hash.includes('type=recovery')) {
            // Only set error if still verifying and no recovery hash (e.g. direct navigation)
            console.log("UpdatePasswordPage: Initial session is null or signed out, and no recovery hash present.");
            setVerificationStatus('error');
            setPageMessage("Invalid or expired password reset link. Please request a new one if needed.");
        }
      }
    });
    
    // Initial check when component mounts
    if (typeof window !== 'undefined' && verificationStatus === 'verifying') {
        if (window.location.hash.includes('type=recovery') && window.location.hash.includes('access_token')) {
            // Valid fragment structure found, Supabase client will process it. Wait for PASSWORD_RECOVERY event.
            console.log("UpdatePasswordPage: Recovery fragment found in URL. Waiting for Supabase client processing.");
            verificationTimeoutId = setTimeout(() => {
                if (mounted && verificationStatus === 'verifying') {
                    console.warn("UpdatePasswordPage: Timeout waiting for PASSWORD_RECOVERY event. Link might be invalid/expired or client processing issue.");
                    setVerificationStatus('error');
                    setPageMessage("Could not verify the password reset link. It may be invalid, expired, or already used. Please request a new one.");
                }
            }, 8000); // 8 seconds timeout
        } else {
            // No valid recovery fragment found on mount.
            console.log("UpdatePasswordPage: No valid recovery fragment in URL on mount. Invalid access.");
            setVerificationStatus('error');
            setPageMessage("Invalid password reset link. Please use the link from your email or request a new reset.");
        }
    }

    return () => {
      mounted = false;
      if (verificationTimeoutId) clearTimeout(verificationTimeoutId);
      authListener?.subscription?.unsubscribe();
      console.log('UpdatePasswordPage: Unsubscribed from auth state changes.');
    };
  }, [supabase, verificationStatus]); // React to changes in verificationStatus to manage timeouts correctly.

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
    
    // Clear previous client-side messages
    setPageMessage(null); 

    if (newPassword !== confirmPassword) {
      setPageMessage("Passwords do not match."); // Show client-side error
      // setPageMessageType("error"); // If you had a separate type state
      return;
    }
    if (!isNewPasswordClientValid) {
      setPageMessage("Password does not meet all requirements."); // Show client-side error
      // setPageMessageType("error");
      return;
    }
    
    setIsLoading(true);
    const formData = new FormData(event.currentTarget);
    
    // The server action will handle redirects or return an error that populates URL params.
    // If it were to return an error object directly to the client:
    // const result = await updatePassword(formData);
    // if (result?.error) {
    //   setPageMessage(result.error);
    //   setPageMessageType("error");
    //   setIsLoading(false);
    // }
    // However, the current action redirects.
    await updatePassword(formData);

    // If action redirects, this might not be reached or component unmounts.
    // setIsLoading(false); 
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f8f9fa] py-12 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <a href="/" className="w-fit mx-auto mb-6 logo text-3xl font-extrabold text-[#2c2d5a] tracking-tight flex items-center gap-2 hover:text-[#ff3366] transition" style={{fontFamily: 'Inter, Segoe UI, Arial, sans-serif', letterSpacing: '0.01em'}}>
            Cheap <span className="text-[#ff3366]">CC</span>
        </a>
        <h1 className="text-2xl font-bold text-[#2c2d5a] mb-2 text-center">Set Your New Password</h1>

        {/* Component for messages from URL parameters */}
        <Suspense fallback={<div className="my-4 p-3 rounded-md text-sm font-medium bg-gray-100 text-gray-700">Loading...</div>}>
          <UpdatePasswordMessages /> {/* Handles messages from URL params if server action redirects back here with error */}
        </Suspense>

        {pageMessage && verificationStatus !== 'ready' && (
          <div className={`my-4 p-3 rounded-md text-sm font-medium ${
            verificationStatus === 'error' ? 'bg-red-100 text-red-700' :
            verificationStatus === 'info' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
          }`}>
            {pageMessage}
          </div>
        )}

        {verificationStatus === 'ready' ? (
          <>
            {pageMessage && ( /* For client-side validation errors from handleSubmit */
              <div className="my-4 p-3 rounded-md text-sm font-medium bg-red-100 text-red-700">
                {pageMessage}
              </div>
            )}
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
              {confirmPassword.length > 0 && newPassword.length > 0 && newPassword !== confirmPassword && (
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
          </>
        ) : verificationStatus === 'verifying' && !pageMessage ? (
          <p className="text-center text-gray-500 py-4">Verifying reset link or session...</p>
        ) : null }
        
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