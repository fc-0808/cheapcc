'use client';

import React, { useState, useEffect, Suspense, useRef } from 'react';
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

  const isInRecoveryModeRef = useRef(false);
  const verificationTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Use ref for timeout ID


  useEffect(() => {
    let mounted = true;
    console.log('UpdatePasswordPage: Auth effect initiated.');

    // Clear any existing timeout when the effect runs or re-runs.
    if (verificationTimeoutRef.current) {
      clearTimeout(verificationTimeoutRef.current);
      verificationTimeoutRef.current = null;
    }

    const initialHash = typeof window !== 'undefined' ? window.location.hash : "";
    const isInitialRecoveryAttempt = initialHash.includes('type=recovery') && initialHash.includes('access_token');

    if (isInitialRecoveryAttempt) {
      // If recovery fragment is present, prioritize recovery flow.
      // Only set to 'verifying' if not already 'ready' or 'error'.
      if (verificationStatus !== 'ready' && verificationStatus !== 'error') {
        console.log("UpdatePasswordPage: Recovery fragment detected. Setting state to 'verifying' and awaiting PASSWORD_RECOVERY event.");
        setVerificationStatus('verifying');
        setPageMessage(null); // Clear previous messages
        isInRecoveryModeRef.current = false; // Explicitly reset until PASSWORD_RECOVERY event

        verificationTimeoutRef.current = setTimeout(() => {
          if (mounted && !isInRecoveryModeRef.current && verificationStatus === 'verifying') {
            console.warn("UpdatePasswordPage: Timeout waiting for PASSWORD_RECOVERY. Link may be invalid/expired.");
            setVerificationStatus('error');
            setPageMessage("Could not verify the password reset link. It may be invalid, expired, or already used. Please request a new one.");
          }
        }, 8000);
      }
    } else if (verificationStatus === 'verifying' && !isInRecoveryModeRef.current) {
      // No recovery fragment, and we are in the initial 'verifying' state (and not yet in confirmed recovery mode).
      // Check for an existing normal session.
      console.log("UpdatePasswordPage: No recovery fragment. Checking for existing session.");
      supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
        if (!mounted) return;
        if (session && !isInRecoveryModeRef.current) { // Double check isInRecoveryModeRef
          console.log("UpdatePasswordPage: No recovery fragment, but an active session exists. Setting to 'info'.");
          setVerificationStatus('info');
          setPageMessage("This page is for password recovery. To change your password while logged in, please go to your profile page.");
        } else if (!session && !isInRecoveryModeRef.current) {
          console.log("UpdatePasswordPage: No recovery fragment and no active session. Setting to 'error'.");
          setVerificationStatus('error');
          setPageMessage("Invalid password reset link. Please request a new one or use the link from your email.");
        }
      });
    }

    const { data: authListener } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      if (!mounted) return;
      console.log(`UpdatePasswordPage: Auth event: ${event}`, session ? `User ID: ${session.user?.id?.substring(0,5)}` : 'No session', `Current isInRecoveryMode: ${isInRecoveryModeRef.current}`, `Current verificationStatus: ${verificationStatus}`);

      if (event === "PASSWORD_RECOVERY") {
        console.log("UpdatePasswordPage: PASSWORD_RECOVERY event received. Setting to 'ready'.");
        if (verificationTimeoutRef.current) {
          clearTimeout(verificationTimeoutRef.current);
          verificationTimeoutRef.current = null;
        }
        isInRecoveryModeRef.current = true;
        setVerificationStatus('ready');
        setPageMessage(null);
      } else if (isInRecoveryModeRef.current) {
        // If PASSWORD_RECOVERY has already established recovery mode,
        // don't let other events (like subsequent SIGNED_IN or USER_UPDATED for the recovery session)
        // pull us out of the 'ready' state, unless it's a SIGNED_OUT.
        if (event === "SIGNED_OUT") {
            console.log("UpdatePasswordPage: SIGNED_OUT event received while in recovery mode. Resetting.");
            isInRecoveryModeRef.current = false;
            // This usually means the password was updated and server action signed out.
            // The page will redirect via server action, but good to reset state.
            setVerificationStatus('info'); // Or 'error' depending on context, but redirect is expected
            setPageMessage("Password updated. Redirecting...");
        } else {
            console.log(`UpdatePasswordPage: Event ${event} received while in recovery mode. Maintaining 'ready' state.`);
            if(verificationStatus !== 'ready') setVerificationStatus('ready'); // Ensure it stays ready
        }
      } else {
        // Not in established recovery mode (PASSWORD_RECOVERY hasn't successfully fired and set the ref)
        const currentHash = typeof window !== 'undefined' ? window.location.hash : "";
        const hasRecoveryHashNow = currentHash.includes('type=recovery') && currentHash.includes('access_token');

        if (session && !hasRecoveryHashNow) {
          // A session exists, and there's NO current recovery hash (it might have been cleared after a failed attempt or was never there)
          console.log(`UpdatePasswordPage: Event ${event} with session, but no recovery hash. Setting to 'info'.`);
          if (verificationTimeoutRef.current) clearTimeout(verificationTimeoutRef.current);
          setVerificationStatus('info');
          setPageMessage("This page is for password recovery. To change your password while logged in, please go to your profile page.");
        } else if (!session && !hasRecoveryHashNow) {
          // No session and no recovery hash.
          // This is an error unless we were initially processing a hash (isInitialRecoveryAttempt was true)
          // and are still in 'verifying' state (waiting for PASSWORD_RECOVERY or timeout).
          if (!isInitialRecoveryAttempt && verificationStatus !== 'ready') { // Avoid setting error if successfully got ready then signed out
            console.log(`UpdatePasswordPage: Event ${event} - no session, no recovery hash, wasn't initial attempt. Error.`);
            if (verificationTimeoutRef.current) clearTimeout(verificationTimeoutRef.current);
            setVerificationStatus('error');
            setPageMessage("Invalid or expired password reset link. Please try again.");
          }
        }
        // If isInitialRecoveryAttempt is true and we get here, we are still waiting for PASSWORD_RECOVERY or timeout.
      }
    });

    return () => {
      mounted = false;
      if (verificationTimeoutRef.current) {
        clearTimeout(verificationTimeoutRef.current);
      }
      authListener?.subscription?.unsubscribe();
      console.log('UpdatePasswordPage: Auth effect unmounted.');
    };
  // Dependencies: supabase ensures the client is stable.
  // verificationStatus is included because its changes might necessitate re-evaluating parts of the logic,
  // particularly the initial check if it hasn't resolved to 'ready' or 'error'.
  // router is included if navigation is done from within the effect.
  }, [supabase, router, verificationStatus]);


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
    setPageMessage(null); 

    if (newPassword !== confirmPassword) {
      setPageMessage("Passwords do not match.");
      return;
    }
    if (!isNewPasswordClientValid) {
      setPageMessage("Password does not meet all requirements.");
      return;
    }
    
    setIsLoading(true);
    const formData = new FormData(event.currentTarget);
    // The updatePassword server action will handle redirect or error messages via URL params.
    // The client-side message state (pageMessage) is mostly for client-side validation errors here.
    await updatePassword(formData);
    // setIsLoading(false); // This line might not be reached if updatePassword always redirects.
                          // If it can return without redirecting (e.g. on caught error that's not a redirect),
                          // then setIsLoading(false) would be appropriate in a .finally() or after the await.
                          // However, the current action redirects on errors too.
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f8f9fa] py-12 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <a href="/" className="w-fit mx-auto mb-6 logo text-3xl font-extrabold text-[#2c2d5a] tracking-tight flex items-center gap-2 hover:text-[#ff3366] transition" style={{fontFamily: 'Inter, Segoe UI, Arial, sans-serif', letterSpacing: '0.01em'}}>
            Cheap <span className="text-[#ff3366]">CC</span>
        </a>
        <h1 className="text-2xl font-bold text-[#2c2d5a] mb-2 text-center">Set Your New Password</h1>

        <Suspense fallback={<div className="my-4 p-3 rounded-md text-sm font-medium bg-gray-100 text-gray-700">Loading...</div>}>
          <UpdatePasswordMessages />
        </Suspense>

        {/* Display messages set by client-side logic (e.g., initial link errors, timeout, form validation) */}
        {pageMessage && (verificationStatus === 'error' || verificationStatus === 'info' || (verificationStatus === 'ready' && pageMessage /* for form submit errors */) ) && (
          <div className={`my-4 p-3 rounded-md text-sm font-medium ${
            verificationStatus === 'error' || (verificationStatus === 'ready' && pageMessage && newPassword !== confirmPassword) || (verificationStatus === 'ready' && pageMessage && !isNewPasswordClientValid) ? 'bg-red-100 text-red-700' :
            verificationStatus === 'info' ? 'bg-blue-100 text-blue-700' : ''
          }`}>
            {pageMessage}
          </div>
        )}

        {verificationStatus === 'ready' ? (
          <>
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
          <div className="text-center py-4">
             <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#ff3366] mx-auto mb-3"></div>
             <p className="text-gray-500">Verifying reset link...</p>
          </div>
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