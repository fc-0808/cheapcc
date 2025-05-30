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
  const initialHashCheckedRef = useRef(false); // To ensure initial hash check logic runs once

  useEffect(() => {
    let mounted = true;
    console.log('UpdatePasswordPage: Auth effect initiated.');

    if (verificationTimeoutRef.current) {
      clearTimeout(verificationTimeoutRef.current);
      verificationTimeoutRef.current = null;
    }

    // This block should run only once on initial mount to check the hash
    if (!initialHashCheckedRef.current) {
      const initialHash = typeof window !== 'undefined' ? window.location.hash : "";
      const isInitialRecoveryAttempt = initialHash.includes('type=recovery') && initialHash.includes('access_token');

      if (isInitialRecoveryAttempt) {
        console.log("UpdatePasswordPage: Initial Recovery Fragment DETECTED. Setting to 'verifying'.");
        setVerificationStatus('verifying');
        setPageMessage(null);
        isInRecoveryModeRef.current = false; // Will be set true by PASSWORD_RECOVERY event

        verificationTimeoutRef.current = setTimeout(() => {
          if (mounted && !isInRecoveryModeRef.current && verificationStatus === 'verifying') {
            console.warn("UpdatePasswordPage: Timeout waiting for PASSWORD_RECOVERY.");
            setVerificationStatus('error');
            setPageMessage("Could not verify the password reset link. It may be invalid or expired.");
          }
        }, 8000);
      } else {
        console.log("UpdatePasswordPage: Initial Recovery Fragment NOT detected. Checking session.");
        // No recovery fragment, check for an existing normal session.
        supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
          if (!mounted) return;
          if (session) {
            console.log("UpdatePasswordPage: No recovery fragment, active session found. Setting to 'info'.");
            setVerificationStatus('info');
            setPageMessage("This page is for password recovery. To change your password while logged in, please go to your profile page.");
          } else {
            console.log("UpdatePasswordPage: No recovery fragment, no active session. Setting to 'error'.");
            setVerificationStatus('error');
            setPageMessage("Invalid password reset link. Please request a new one.");
          }
        });
      }
      initialHashCheckedRef.current = true;
    }

    const { data: authListener } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      if (!mounted) return;
      console.log(`UpdatePasswordPage: Auth event: ${event}`, `RecoveryMode: ${isInRecoveryModeRef.current}`, `VerificationStatus: ${verificationStatus}`);

      if (event === "PASSWORD_RECOVERY") {
        console.log("UpdatePasswordPage: PASSWORD_RECOVERY event. Setting to 'ready'.");
        if (verificationTimeoutRef.current) {
          clearTimeout(verificationTimeoutRef.current);
          verificationTimeoutRef.current = null;
        }
        isInRecoveryModeRef.current = true;
        setVerificationStatus('ready');
        setPageMessage(null);
      } else if (event === "SIGNED_IN" || event === "INITIAL_SESSION" || event === "USER_UPDATED") {
        // If we are already in confirmed recovery mode, these events should not change the page state away from 'ready'.
        if (isInRecoveryModeRef.current) {
          console.log(`UpdatePasswordPage: ${event} received, but in recovery mode. Maintaining 'ready'.`);
          if (verificationStatus !== 'ready') setVerificationStatus('ready');
          return;
        }
        
        // If not in recovery mode, check if there's a session and NO recovery hash (hash might have been cleared or never existed)
        const currentHash = typeof window !== 'undefined' ? window.location.hash : "";
        if (session && !currentHash.includes('type=recovery')) {
          console.log(`UpdatePasswordPage: ${event} with session, not recovery mode, no recovery hash. Setting 'info'.`);
          if (verificationTimeoutRef.current) clearTimeout(verificationTimeoutRef.current); // Stop timeout if normal session is confirmed
          setVerificationStatus('info');
          setPageMessage("This page is for password recovery. To change your password while logged in, please go to your profile page.");
        }
        // If there's no session and no recovery hash, the initial check (if it ran) would have set error.
        // Or if initial check detected recovery hash, we'd still be waiting for PASSWORD_RECOVERY or timeout.
      } else if (event === "SIGNED_OUT") {
        console.log("UpdatePasswordPage: SIGNED_OUT event.");
        isInRecoveryModeRef.current = false;
        // If not already redirected by server action, treat as an error/end of flow.
        if (verificationStatus !== 'info') { // Avoid overriding an "info" message if already set (e.g. successful update redirecting)
            setVerificationStatus('error');
            setPageMessage("Your session has ended. Please try the password reset process again.");
        }
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
  // Intentionally keeping dependency array minimal to control execution.
  // `verificationStatus` is read from state inside callbacks, which is fine.
  // Re-subscribing to onAuthStateChange on every render isn't ideal but common with Supabase if not memoized.
  // The key is that the initialHashCheckedRef prevents the initial logic from re-running.
  }, [supabase, router]); // Add verificationStatus back if strict conditional re-runs of initial block are needed,
                           // but it might be the source of the complexity.
                           // For now, keeping it simpler. The `initialHashCheckedRef` should manage the "run once" part.


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
    // Server action will redirect or set error messages in URL.
    // setIsLoading(false); // Might not be reached due to redirect.
  };

  // ... rest of the component (return statement) remains the same
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

        {pageMessage && (verificationStatus === 'error' || verificationStatus === 'info' || (verificationStatus === 'ready' && pageMessage ) ) && (
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