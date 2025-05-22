'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/supabase-client';

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [profileMessage, setProfileMessage] = useState('');
  const [profileMessageType, setProfileMessageType] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordMessageType, setPasswordMessageType] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newPasswordTouched, setNewPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);

  // Password requirements state
  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false
  });

  // Calculate overall password validity
  const isPasswordValid = Object.values(passwordRequirements).every(req => req);

  const router = useRouter();
  const supabase = createClient();

  // Fetch profile data on load
  useEffect(() => {
    async function loadProfile() {
      try {
        setIsLoading(true);
        
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('Auth error:', userError);
          setProfileMessage('Authentication error');
          setProfileMessageType('error');
          router.push('/login');
          return;
        }
        
        if (!user) {
          console.log('No user found, redirecting to login');
          router.push('/login');
          return;
        }
        
        // Set email from auth
        setEmail(user.email || '');
        
        console.log('Fetching profile for user ID:', user.id);
        
        // Fetch profile from profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
          
        if (profileError) {
          console.error('Error loading profile:', profileError);
          setProfileMessage(`Failed to load profile: ${profileError.message}`);
          setProfileMessageType('error');
          return;
        }
        
        // If profile doesn't exist yet, create one
        if (!profileData) {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([{ id: user.id, name: user.user_metadata?.name || '' }]);
            
          if (insertError) {
            console.error('Error creating profile:', insertError);
            setProfileMessage('Failed to create profile');
            setProfileMessageType('error');
            return;
          }
          
          // Fetch the newly created profile
          const { data: newProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();
            
            setProfile(newProfile || { name: user.user_metadata?.name || '' });
            setName(newProfile?.name || user.user_metadata?.name || '');
        } else {
          setProfile(profileData);
          setName(profileData.name || '');
        }
      } catch (error) {
        console.error('Profile load error:', error);
        setProfileMessage('An error occurred while loading your profile');
        setProfileMessageType('error');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadProfile();
  }, [router, supabase]);

  // Validate password strength
  useEffect(() => {
    if (newPasswordTouched) {
      setPasswordRequirements({
        minLength: newPassword.length >= 8,
        hasUppercase: /[A-Z]/.test(newPassword),
        hasLowercase: /[a-z]/.test(newPassword)
      });
    }
  }, [newPassword, newPasswordTouched]);

  // Check if passwords match
  useEffect(() => {
    if (confirmPasswordTouched) {
      setPasswordsMatch(newPassword === confirmPassword);
    }
  }, [newPassword, confirmPassword, confirmPasswordTouched]);

  // Update profile handler
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setProfileMessage('Name is required.');
      setProfileMessageType('error');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }
      
      // Update the profile in database
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
        
      if (profileError) {
        throw profileError;
      }
      
      // Also update user metadata so it's consistent across the app
      const { error: metadataError } = await supabase.auth.updateUser({
        data: { name }
      });
      
      if (metadataError) {
        console.error('Failed to update user metadata:', metadataError);
        // Continue execution, this is not critical
      }
      
      setProfileMessage('Profile updated successfully!');
      setProfileMessageType('success');
      
      // Refresh the profile data
      const { data: refreshedProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
        
      if (refreshedProfile) {
        setProfile(refreshedProfile);
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setProfileMessage('Failed to update profile.');
      setProfileMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Password change handler
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessage('All password fields are required.');
      setPasswordMessageType('error');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordMessage('New password and confirmation do not match.');
      setPasswordMessageType('error');
      return;
    }

    if (!isPasswordValid) {
      setPasswordMessage('New password does not meet the requirements.');
      setPasswordMessageType('error');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // First verify the current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: currentPassword,
      });
      
      if (signInError) {
        setPasswordMessage('Current password is incorrect.');
        setPasswordMessageType('error');
        return;
      }
      
      // Only update password if current password verification succeeded
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        throw error;
      }
      
      setPasswordMessage('Password changed successfully!');
      setPasswordMessageType('success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setNewPasswordTouched(false);
      setConfirmPasswordTouched(false);
    } catch (error: any) {
      console.error('Password change error:', error);
      setPasswordMessage(error.message || 'Failed to update password.');
      setPasswordMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle password visibility
  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Handle password input changes
  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
    setNewPasswordTouched(true);
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    setConfirmPasswordTouched(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#f8f9fa]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff3366]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center pt-24 pb-12">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-[#2c2d5a] mb-6 flex items-center gap-2">
          <i className="fas fa-user-circle text-[#ff3366] text-2xl" /> My Profile
        </h1>
        
        {/* Profile Update Form */}
        <form onSubmit={handleProfileUpdate} className="mb-10">
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-[#2c2d5a] mb-1">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#ff3366] focus:border-[#ff3366] transition text-[#2c2d5a]"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-[#2c2d5a] mb-1">Email Address</label>
            <input
              type="email"
              className="w-full px-4 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
              value={email}
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed. Contact support for assistance.</p>
          </div>
          
          {profileMessage && (
            <div className={`mb-4 p-3 rounded-md text-sm font-medium ${profileMessageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {profileMessage}
            </div>
          )}
          
          <button
            type="submit"
            className="py-2 px-6 bg-[#ff3366] text-white font-semibold rounded-lg hover:bg-[#e62e5c] transition-colors duration-300 focus:ring-4 focus:ring-[#ff3366]/50 focus:outline-none shadow-md"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
        
        {/* Password Change Form */}
        <h2 className="text-xl font-semibold text-[#2c2d5a] mb-4 mt-8 flex items-center gap-2">
          <i className="fas fa-key text-[#ff3366]" /> Change Password
        </h2>
        
        <form onSubmit={handlePasswordChange}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div className="md:col-span-2">
              <label htmlFor="currentPassword" className="block text-sm font-medium text-[#2c2d5a] mb-1">Current Password</label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#ff3366] focus:border-[#ff3366] transition text-[#2c2d5a]"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-[#2c2d5a] mb-1">New Password</label>
              <div className="relative">
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#ff3366] transition text-[#2c2d5a] pr-10 ${newPasswordTouched && !isPasswordValid ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200'}`}
                  value={newPassword}
                  onChange={handleNewPasswordChange}
                  required
                />
                <button 
                  type="button" 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-700 focus:outline-none"
                  onClick={toggleNewPasswordVisibility}
                >
                  <i className={`fas ${showNewPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              
              {newPasswordTouched && (
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
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#2c2d5a] mb-1">Confirm New Password</label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#ff3366] transition text-[#2c2d5a] pr-10 ${!passwordsMatch && confirmPasswordTouched ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
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
          </div>
          
          {passwordMessage && (
            <div className={`mb-4 p-3 rounded-md text-sm font-medium ${passwordMessageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {passwordMessage}
            </div>
          )}
          
          <button
            type="submit"
            className="py-2 px-6 bg-[#2c2d5a] text-white font-semibold rounded-lg hover:bg-[#484a9e] transition-colors duration-300 focus:ring-4 focus:ring-[#2c2d5a]/50 focus:outline-none shadow-md"
            disabled={isSubmitting || (newPasswordTouched && (!isPasswordValid || (confirmPasswordTouched && !passwordsMatch)))}
          >
            {isSubmitting ? 'Updating...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
} 