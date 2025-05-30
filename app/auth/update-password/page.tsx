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
  const verificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let mounted = true;
    console.log('UpdatePasswordPage: Auth effect initiated. Current status:', verificationStatus);

    // Clear any previous timeout when the effect runs or re-runs.
    if (verificationTimeoutRef.current) {
      clearTimeout(verificationTimeoutRef.current);
      verificationTimeoutRef.current = null;
      console.log("UpdatePasswordPage: Cleared previous timeout.");
    }

    // Set a timeout only if we are in the initial 'verifying' state and not yet confirmed in recovery mode.
    // This timeout acts as a fallback if Supabase doesn't emit PASSWORD_RECOVERY.
    if (verificationStatus === 'verifying' && !isInRecoveryModeRef.current) {
      console.log("UpdatePasswordPage: Status is 'verifying' and not in recovery mode. Setting timeout for PASSWORD_RECOVERY or session check.");
      verificationTimeoutRef.current = setTimeout(() => {
        if (mounted && verificationStatus === 'verifying' && !isInRecoveryModeRef.current) {
          console.warn("UpdatePasswordPage: Timeout reached. PASSWORD_RECOVERY event not received. Checking current session.");
          supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
            if (!mounted) return;
            if (session && !isInRecoveryModeRef.current) { // Check ref again to be absolutely sure
              console.log("UpdatePasswordPage: Timeout - No recovery confirmation, but an active session found. Setting to 'info'.");
              setVerificationStatus('info');
              setPageMessage("This page is for password recovery. To change your password while logged in, please go to your profile page.");
            } else if (!session && !isInRecoveryModeRef.current) {
              console.log("UpdatePasswordPage: Timeout - No recovery confirmation, and no active session. Setting to 'error'.");
              setVerificationStatus('error');
              setPageMessage("Could not verify the password reset link. It may be invalid, expired, or already used. Please request a new one.");
            }
          });
        }
      }, 6000); // Timeout of 6 seconds
    }

    const { data: authListener } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      if (!mounted) return;
      // Log current states *before* any changes by this handler
      console.log(`UpdatePasswordPage: Auth event: ${event}. Session: ${session ? 'Yes' : 'No'}. RecoveryModeRef: ${isInRecoveryModeRef.current}. CurrentVerificationStatus: ${verificationStatus}`);

      if (event === "PASSWORD_RECOVERY") {
        console.log("UpdatePasswordPage: PASSWORD_RECOVERY event received. Setting to 'ready'.");
        if (verificationTimeoutRef.current) {
          clearTimeout(verificationTimeoutRef.current);
          verificationTimeoutRef.current = null;
          console.log("UpdatePasswordPage: Cleared timeout due to PASSWORD_RECOVERY.");
        }
        isInRecoveryModeRef.current = true;
        setVerificationStatus('ready');
        setPageMessage(null);
      } else if (isInRecoveryModeRef.current) {
        // If PASSWORD_RECOVERY has set us in recovery mode, most other events should not pull us out of 'ready' state.
        if (event === "SIGNED_OUT") {
          console.log("UpdatePasswordPage: SIGNED_OUT event received while in confirmed recovery mode. Resetting.");
          isInRecoveryModeRef.current = false;
          setVerificationStatus('info'); // Or 'error', but usually means server action redirected
          setPageMessage("Password updated. Redirecting..."); // Or a generic session ended message
        } else {
          console.log(`UpdatePasswordPage: Event ${event} received while in recovery mode. Maintaining 'ready' state or allowing Supabase to manage session.`);
           if(verificationStatus !== 'ready') setVerificationStatus('ready');
        }
      } else {
        // Not in confirmed recovery mode yet (isInRecoveryModeRef.current is false)
        if (event === "INITIAL_SESSION" || event === "SIGNED_IN" || event === "USER_UPDATED") {
          // If a session event occurs and we are NOT in recovery mode,
          // AND the timeout is still pending (meaning PASSWORD_RECOVERY hasn't fired yet),
          // we let the timeout logic eventually decide.
          // However, if the timeout has already fired and set an error/info state, that should persist.
          if (session && verificationStatus === 'verifying') {
            console.log(`UpdatePasswordPage: ${event} with session. Still 'verifying'. Timeout will handle if no PASSWORD_RECOVERY.`);
          } else if (!session && verificationStatus === 'verifying') {
            console.log(`UpdatePasswordPage: ${event} with NO session. Still 'verifying'. Timeout will handle if no PASSWORD_RECOVERY.`);
          }
          // If verificationStatus is already 'info' or 'error' (e.g. from timeout), don't change it here
          // unless it's a specific transition we want.
        } else if (event === "SIGNED_OUT") {
          console.log("UpdatePasswordPage: SIGNED_OUT event (and not in recovery mode).");
          if (verificationTimeoutRef.current) {
            clearTimeout(verificationTimeoutRef.current);
            verificationTimeoutRef.current = null;
          }
          // This likely means an invalid state or link if user was expecting recovery
          setVerificationStatus('error');
          setPageMessage("Your session has ended or the link is invalid. Please start the password reset process again.");
        }
      }
    });

    return () => {
      mounted = false;
      if (verificationTimeoutRef.current) {
        clearTimeout(verificationTimeoutRef.current);
        console.log("UpdatePasswordPage: Cleared timeout on unmount.");
      }
      authListener?.subscription?.unsubscribe();
      console.log('UpdatePasswordPage: Auth effect unmounted.');
    };
  // Add verificationStatus to dependency array. When it changes, the effect re-runs.
  // The timeout clearing and conditional setting logic inside should prevent multiple timeouts.
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
    await updatePassword(formData);
    // Server action handles redirects.
  };

  // ... JSX remains the same
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

        {pageMessage && (verificationStatus === 'error' || verificationStatus === 'info' || (verificationStatus === 'ready' && pageMessage /* for form submit errors */) ) && (
          <div className={`my-4 p-3 rounded-md text-sm font-medium ${
            verificationStatus === 'error' || (verificationStatus === 'ready' && pageMessage && (newPassword !== confirmPassword || !isNewPasswordClientValid)) ? 'bg-red-100 text-red-700' :
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