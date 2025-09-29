// app/profile/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/supabase-client";
import { updateProfile, changeUserPasswordOnProfile, updatePreferences } from "./actions";

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [isSubmittingPrefs, setIsSubmittingPrefs] = useState(false);

  const [profileMessage, setProfileMessage] = useState("");
  const [profileMessageType, setProfileMessageType] = useState<"success" | "error" | "">("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordMessageType, setPasswordMessageType] = useState<"success" | "error" | "warning" | "">("");
  const [prefsMessage, setPrefsMessage] = useState("");
  const [prefsMessageType, setPrefsMessageType] = useState<"success" | "error" | "">("");

  // State for the new password form
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newPasswordTouched, setNewPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);

  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false, hasUppercase: false, hasLowercase: false, hasNumber: false, hasSpecialChar: false,
  });

  const isNewPasswordClientValid = Object.values(passwordRequirements).every((req) => req);
  const passwordsMatch = newPassword === confirmPassword || !confirmPasswordTouched;

  const router = useRouter();
  const supabase = createClient();

  // Effect to load user profile data
  useEffect(() => {
    async function loadProfile() {
      setIsLoading(true);
      const { data: { user },  error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push("/login");
        return;
      }

      setEmail(user.email || "");
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("name, is_subscribed_to_marketing")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        setProfileMessage(`Failed to load profile: ${profileError.message}`);
        setProfileMessageType("error");
      }
      
      if (profileData) {
        setName(profileData.name || user.user_metadata?.name || user.email?.split("@")[0] || "");
        setIsSubscribed(profileData.is_subscribed_to_marketing ?? false);
      } else {
        setName(user.user_metadata?.name || user.email?.split("@")[0] || "");
      }
      
      setIsLoading(false);
    }
    loadProfile();
  }, [router, supabase]);

  // Effect for password strength calculation
  useEffect(() => {
    setPasswordRequirements({
      minLength: newPassword.length >= 8,
      hasUppercase: /[A-Z]/.test(newPassword),
      hasLowercase: /[a-z]/.test(newPassword),
      hasNumber: /[0-9]/.test(newPassword),
      hasSpecialChar: /[^a-zA-Z0-9]/.test(newPassword),
    });
  }, [newPassword]);

  // Handlers for form submissions
  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) {
      setProfileMessage("Name cannot be empty.");
      setProfileMessageType("error");
      return;
    }
    setIsSubmittingProfile(true);
    setProfileMessage(""); setProfileMessageType("");

    try {
      const result = await updateProfile(name);

      if (result.error) {
        setProfileMessage(result.error);
        setProfileMessageType("error");
      } else if (result.success) {
        setProfileMessage(result.message || "Profile updated successfully!");
        setProfileMessageType("success");
      }
    } catch (error) {
      setProfileMessage("An unexpected error occurred.");
      setProfileMessageType("error");
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  const handlePasswordChangeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordMessage(""); setPasswordMessageType("");

    if (!currentPassword) {
      setPasswordMessage("Current password is required.");
      setPasswordMessageType("error");
      return;
    }

    if (!newPassword || !confirmPassword) {
      setPasswordMessage("New password and confirmation are required.");
      setPasswordMessageType("error"); 
      return;
    }
    
    if (!isNewPasswordClientValid) {
      setPasswordMessage("New password does not meet all requirements.");
      setPasswordMessageType("warning"); 
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordMessage("New passwords do not match.");
      setPasswordMessageType("error"); 
      return;
    }

    setIsSubmittingPassword(true);
    
    try {
      const result = await changeUserPasswordOnProfile(currentPassword, newPassword);

      if (result.error) {
        setPasswordMessage(result.error);
        setPasswordMessageType("error");
      } else if (result.success) {
        setPasswordMessage(result.message || "Password changed successfully!");
        setPasswordMessageType("success");
        setCurrentPassword("");
        setNewPassword(""); 
        setConfirmPassword("");
        setNewPasswordTouched(false); 
        setConfirmPasswordTouched(false);
      }
    } catch (error) {
      setPasswordMessage("An unexpected error occurred.");
      setPasswordMessageType("error");
    } finally {
      setIsSubmittingPassword(false);
    }
  };
  
  const handlePreferencesUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmittingPrefs(true);
    setPrefsMessage(""); setPrefsMessageType("");

    try {
      const result = await updatePreferences(isSubscribed);
      
      if (result.error) {
        setPrefsMessage(result.error);
        setPrefsMessageType("error");
      } else if (result.success) {
        setPrefsMessage(result.message || "Preferences updated!");
        setPrefsMessageType("success");
      }
    } catch (error) {
      setPrefsMessage("An unexpected error occurred.");
      setPrefsMessageType("error");
    } finally {
      setIsSubmittingPrefs(false);
    }
  };
  
  // Loading state UI
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f111a]">
        <div className="text-center relative">
          <div className="mb-8 flex items-center justify-center">
            <div className="text-3xl font-extrabold text-white tracking-tight">
              Cheap<span className="text-[#ff3366] relative inline-flex">CC
                <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-[#ff3366] rounded-full animate-ping opacity-60"></span>
              </span>
            </div>
          </div>
          <div className="w-16 h-16 border-4 border-[rgba(255,255,255,0.1)] border-t-[#ff3366] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-medium text-gray-300">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Helper for message display
  const renderMessage = (message: string, type: string) => {
    if (!message) return null;
    const isSuccess = type === 'success';
    const isWarning = type === 'warning';
    const bgColor = isSuccess ? 'bg-green-500/10' : isWarning ? 'bg-yellow-500/10' : 'bg-red-500/10';
    const textColor = isSuccess ? 'text-green-400' : isWarning ? 'text-yellow-400' : 'text-red-400';
    const icon = isSuccess ? 'fa-check-circle' : isWarning ? 'fa-exclamation-triangle' : 'fa-times-circle';

    return (
      <div className={`text-sm p-3 rounded-md flex items-start gap-3 ${bgColor} ${textColor}`}>
        <i className={`fas ${icon} mt-0.5`}></i>
        <span>{message}</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f111a] flex items-center justify-center p-4 sm:p-6 lg:p-8 pt-24">
      <div className="w-full max-w-2xl">
        <div className="mb-6 flex items-center justify-center flex-col">
          <h1 className="text-3xl font-bold text-white mb-1 bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 bg-clip-text md:Unbeatable Adobe CC Valuept-20">Account Settings</h1>
          <p className="text-gray-400 text-sm pt-2">Manage your profile and preferences</p>
        </div>
        
        <div className="space-y-5">
          {/* Personal Information */}
          <div className="rounded-xl overflow-hidden"
            style={{
              background: "rgba(17, 17, 40, 0.7)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)"
            }}>
            <div className="p-4 border-b border-white/10">
              <h2 className="text-base font-semibold text-white flex items-center gap-2.5">
                <i className="fas fa-user-circle text-[#ff3366]"></i>
                Personal Information
              </h2>
              <p className="mt-1 text-xs text-gray-400">Update your name and view your email address</p>
            </div>
            
            <div className="p-4">
              <form onSubmit={handleProfileUpdate} className="space-y-3">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                  <input 
                    id="name" 
                    name="name" 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                    placeholder="Enter your full name" 
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-[#ff3366]/20 focus:border-[#ff3366] transition text-white text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
                  <input 
                    id="email" 
                    name="email" 
                    type="email" 
                    value={email} 
                    disabled 
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-400 text-sm cursor-not-allowed"
                  />
                </div>
                
                {renderMessage(profileMessage, profileMessageType)}
                
                <div className="pt-1">
                  <button 
                    type="submit" 
                    className="py-2 px-4 bg-white/10 hover:bg-white/15 text-white font-medium rounded-lg transition focus:ring-4 focus:ring-white/5 disabled:opacity-60 text-sm flex items-center justify-center gap-2" 
                    disabled={isSubmittingProfile}
                  >
                    {isSubmittingProfile ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save"></i>
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Change Password */}
          <div className="rounded-xl overflow-hidden"
            style={{
              background: "rgba(17, 17, 40, 0.7)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)"
            }}>
            <div className="p-4 border-b border-white/10">
              <h2 className="text-base font-semibold text-white flex items-center gap-2.5">
                <i className="fas fa-lock text-[#ff3366]"></i>
                Security
              </h2>
              <p className="mt-1 text-xs text-gray-400">Update your password to keep your account secure</p>
            </div>
            
            <div className="p-4">
              <form onSubmit={handlePasswordChangeSubmit} className="space-y-3">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-300 mb-1">Current Password</label>
                  <div className="relative">
                    <input 
                      id="currentPassword" 
                      name="currentPassword" 
                      type={showCurrentPassword ? "text" : "password"} 
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required 
                      placeholder="Enter current password" 
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-[#ff3366]/20 focus:border-[#ff3366] transition text-white pr-10 text-sm"
                    />
                    <button 
                      type="button" 
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition" 
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      <i className={`fas ${showCurrentPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="newPasswordProfile" className="block text-sm font-medium text-gray-300 mb-1">New Password</label>
                  <div className="relative">
                    <input 
                      id="newPasswordProfile" 
                      name="newPassword" 
                      type={showNewPassword ? "text" : "password"} 
                      value={newPassword} 
                      onChange={(e) => { setNewPassword(e.target.value); setNewPasswordTouched(true); }} 
                      required 
                      placeholder="Enter new password" 
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-[#ff3366]/20 focus:border-[#ff3366] transition text-white pr-10 text-sm"
                    />
                    <button 
                      type="button" 
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition" 
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      <i className={`fas ${showNewPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                    </button>
                  </div>
                  
                  {newPasswordTouched && (
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 bg-white/5 p-2 rounded-lg border border-white/10 text-xs">
                      {Object.entries(passwordRequirements).map(([key, valid]) => (
                        <p key={key} className={`flex items-center gap-1.5 ${valid ? "text-green-400" : "text-gray-400"}`}>
                          <i className={`fas ${valid ? "fa-check-circle text-green-400" : "fa-circle text-gray-500"}`}></i>
                          {key === "minLength" ? "At least 8 characters" :
                           key === "hasUppercase" ? "One uppercase letter" :
                           key === "hasLowercase" ? "One lowercase letter" :
                           key === "hasNumber" ? "One number" :
                           "One special character"}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
                
                <div>
                  <label htmlFor="confirmPasswordProfile" className="block text-sm font-medium text-gray-300 mb-1">Confirm New Password</label>
                  <div className="relative">
                    <input 
                      id="confirmPasswordProfile" 
                      name="confirmPassword" 
                      type={showConfirmPassword ? "text" : "password"} 
                      value={confirmPassword} 
                      onChange={(e) => { setConfirmPassword(e.target.value); setConfirmPasswordTouched(true); }} 
                      required 
                      placeholder="Confirm new password" 
                      className={`w-full px-3 py-2 bg-white/5 border rounded-lg focus:ring-2 focus:ring-[#ff3366]/20 transition text-white pr-10 text-sm ${!passwordsMatch ? "border-red-500/50 bg-red-500/10" : "border-white/10"}`}
                    />
                    <button 
                      type="button" 
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition" 
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <i className={`fas ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                    </button>
                  </div>
                  
                  {!passwordsMatch && (
                    <p className="mt-1 text-xs text-red-400 flex items-center gap-1.5">
                      <i className="fas fa-exclamation-circle"></i>
                      Passwords don't match
                    </p>
                  )}
                </div>
                
                {renderMessage(passwordMessage, passwordMessageType)}
                
                <div className="pt-1">
                  <button 
                    type="submit" 
                    className="py-2 px-4 bg-[#ff3366] text-white font-medium rounded-lg hover:bg-[#ff4b7d] transition focus:ring-4 focus:ring-[#ff3366]/25 disabled:opacity-60 text-sm flex items-center justify-center gap-2" 
                    disabled={isSubmittingPassword || !isNewPasswordClientValid || !passwordsMatch || !newPassword || !currentPassword}
                  >
                    {isSubmittingPassword ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <i className="fas fa-key"></i>
                        <span>Update Password</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Preferences */}
          <div className="rounded-xl overflow-hidden"
            style={{
              background: "rgba(17, 17, 40, 0.7)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)"
            }}>
            <div className="p-4 border-b border-white/10">
              <h2 className="text-base font-semibold text-white flex items-center gap-2.5">
                <i className="fas fa-bell text-[#ff3366]"></i>
                Communication Preferences
              </h2>
              <p className="mt-1 text-xs text-gray-400">Control how we communicate with you</p>
            </div>
            
            <div className="p-4">
              <form onSubmit={handlePreferencesUpdate} className="space-y-3">
                <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                  <label htmlFor="marketingConsent" className="flex items-center justify-between cursor-pointer gap-3">
                    <div>
                      <span className="text-sm font-medium text-white">Marketing Communications</span>
                      <p className="text-xs text-gray-400 mt-0.5">Receive exclusive offers, tips, and product updates from CheapCC</p>
                    </div>
                    <div className="relative">
                      <input 
                        id="marketingConsent" 
                        name="marketingConsent" 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={isSubscribed} 
                        onChange={(e) => setIsSubscribed(e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#ff3366]/30 peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-700 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ff3366]"></div>
                    </div>
                  </label>
                </div>
                
                {renderMessage(prefsMessage, prefsMessageType)}
                
                <div className="pt-1">
                  <button 
                    type="submit" 
                    className="py-2 px-4 bg-white/10 hover:bg-white/15 text-white font-medium rounded-lg transition focus:ring-4 focus:ring-white/5 disabled:opacity-60 text-sm flex items-center justify-center gap-2" 
                    disabled={isSubmittingPrefs}
                  >
                    {isSubmittingPrefs ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check"></i>
                        <span>Save Preferences</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-center text-xs text-gray-400">
          <p>Need help? <a href="#" className="text-[#ff3366] hover:underline">Contact Support</a></p>
        </div>
      </div>
    </div>
  );
}