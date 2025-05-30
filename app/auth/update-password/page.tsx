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
  const hasCheckedInitialFragmentRef = useRef(false); // To ensure initial fragment check runs once

  useEffect(() => {
    let mounted = true;
    let verificationTimeoutId: NodeJS.Timeout | null = null;

    console.log('UpdatePasswordPage: useEffect for auth handling mounted/updated.');

    const processRecoveryAttempt = () => {
      if (typeof window !== 'undefined' && window.location.hash.includes('type=recovery') && window.location.hash.includes('access_token')) {
        console.log("UpdatePasswordPage: Recovery fragment detected. Actively waiting for PASSWORD_RECOVERY event.");
        verificationTimeoutId = setTimeout(() => {
          if (mounted && !isInRecoveryModeRef.current && verificationStatus === 'verifying') {
            console.warn("UpdatePasswordPage: Timeout waiting for PASSWORD_RECOVERY. Link might be invalid/expired.");
            setVerificationStatus('error');
            setPageMessage("Could not verify the password reset link. It may be invalid, expired, or already used. Please request a new one.");
          }
        }, 8000);
      } else {
        console.log("UpdatePasswordPage: No recovery fragment. Checking for existing session for non-recovery access.");
        supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
          if (!mounted) return;
          if (session && !isInRecoveryModeRef.current) { // Check isInRecoveryModeRef here too
            console.log("UpdatePasswordPage: No recovery fragment, but an active session exists. Showing info message.");
            setVerificationStatus('info');
            setPageMessage("This page is for password recovery. To change your password while logged in, please go to your profile page.");
          } else if (!session) {
            console.log("UpdatePasswordPage: No recovery fragment and no active session. Invalid access.");
            setVerificationStatus('error');
            setPageMessage("Invalid password reset link. Please use the link from your email or request a new reset.");
          }
        });
      }
    };

    if (!hasCheckedInitialFragmentRef.current && verificationStatus === 'verifying') {
      processRecoveryAttempt();
      hasCheckedInitialFragmentRef.current = true;
    }

    const { data: authListener } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      if (!mounted) return;
      console.log(`UpdatePasswordPage: Auth event: ${event}`, session ? `User ID: ${session.user?.id?.substring(0,5)}` : 'No session', `Current isInRecoveryMode: ${isInRecoveryModeRef.current}`);

      if (event === "PASSWORD_RECOVERY") {
        console.log("UpdatePasswordPage: PASSWORD_RECOVERY event received. Setting to ready.");
        isInRecoveryModeRef.current = true;
        if (verificationTimeoutId) clearTimeout(verificationTimeoutId);
        setVerificationStatus('ready');
        setPageMessage(null);
      } else if (event === "SIGNED_IN" && session) {
        console.log("UpdatePasswordPage: SIGNED_IN event received.");
        if (!isInRecoveryModeRef.current &&
            typeof window !== 'undefined' &&
            !window.location.hash.includes('type=recovery')) {
          console.log("UpdatePasswordPage: SIGNED_IN event, but not in recovery mode and no recovery fragment. Showing info.");
          setVerificationStatus('info');
          setPageMessage("This page is for password recovery. To change your password while logged in, please go to your profile page.");
        }
      } else if (event === "INITIAL_SESSION") {
        console.log("UpdatePasswordPage: INITIAL_SESSION event.", session ? "Session present." : "No session.");
        if (!session && !isInRecoveryModeRef.current &&
            typeof window !== 'undefined' &&
            !window.location.hash.includes('type=recovery') &&
            verificationStatus === 'verifying') {
          console.log("UpdatePasswordPage: INITIAL_SESSION is null, not recovery. Setting error.");
          setVerificationStatus('error');
          setPageMessage("Invalid or expired password reset link.");
        } else if (session && !isInRecoveryModeRef.current &&
                   typeof window !== 'undefined' &&
                   !window.location.hash.includes('type=recovery') &&
                   verificationStatus === 'verifying') {
          console.log("UpdatePasswordPage: INITIAL_SESSION has user, not recovery. Setting info.");
          setVerificationStatus('info');
          setPageMessage("This page is for password recovery. To change your password while logged in, please go to your profile page.");
        }
      } else if (event === "SIGNED_OUT") {
        console.log("UpdatePasswordPage: SIGNED_OUT event received.");
        if (isInRecoveryModeRef.current) {
          isInRecoveryModeRef.current = false;
        }
        if (verificationStatus === 'verifying' &&
            typeof window !== 'undefined' &&
            !window.location.hash.includes('type=recovery')) {
            setVerificationStatus('error');
            setPageMessage("Your session has ended or the link is invalid. Please try again.");
        }
      }
    });

    return () => {
      mounted = false;
      if (verificationTimeoutId) clearTimeout(verificationTimeoutId);
      authListener?.subscription?.unsubscribe();
      console.log('UpdatePasswordPage: useEffect for auth handling unmounted.');
    };
  }, [supabase, verificationStatus]);

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
    // setIsLoading(false); // Might not be reached if action always redirects
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

        {/* Display messages set by client-side logic (e.g., initial link errors, timeout) */}
        {pageMessage && (verificationStatus === 'error' || verificationStatus === 'info') && (
          <div className={`my-4 p-3 rounded-md text-sm font-medium ${
            verificationStatus === 'error' ? 'bg-red-100 text-red-700' :
            verificationStatus === 'info' ? 'bg-blue-100 text-blue-700' : ''
          }`}>
            {pageMessage}
          </div>
        )}

        {verificationStatus === 'ready' ? (
          <>
            {/* Display client-side validation errors from handleSubmit */}
            {pageMessage && verificationStatus === 'ready' && ( 
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
        ) : verificationStatus === 'verifying' && !pageMessage ? ( // Only show "Verifying" if no other message is already set
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