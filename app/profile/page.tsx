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

    const formData = new FormData(e.currentTarget);
    const result = await updateProfile(formData);

    if (result.error) {
      setProfileMessage(result.error);
      setProfileMessageType("error");
    } else if (result.success) {
      setProfileMessage(result.message || "Profile updated successfully!");
      setProfileMessageType("success");
    }
    setIsSubmittingProfile(false);
  };

  const handlePasswordChangeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordMessage(""); setPasswordMessageType("");

    if (!newPassword || !confirmPassword) {
      setPasswordMessage("New password and confirmation are required.");
      setPasswordMessageType("error"); return;
    }
    if (!isNewPasswordClientValid) {
      setPasswordMessage("New password does not meet all requirements.");
      setPasswordMessageType("warning"); return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage("New passwords do not match.");
      setPasswordMessageType("error"); return;
    }

    setIsSubmittingPassword(true);
    const formData = new FormData(e.currentTarget);
    const result = await changeUserPasswordOnProfile(formData);

    if (result.error) {
      setPasswordMessage(result.error);
      setPasswordMessageType("error");
    } else if (result.success) {
      setPasswordMessage(result.message || "Password changed successfully!");
      setPasswordMessageType("success");
      setNewPassword(""); setConfirmPassword("");
      setNewPasswordTouched(false); setConfirmPasswordTouched(false);
    }
    setIsSubmittingPassword(false);
  };
  
  const handlePreferencesUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmittingPrefs(true);
    setPrefsMessage(""); setPrefsMessageType("");

    const formData = new FormData(e.currentTarget);
    const result = await updatePreferences(formData);
    
    if (result.error) {
        setPrefsMessage(result.error);
        setPrefsMessageType("error");
    } else if (result.success) {
        setPrefsMessage(result.message || "Preferences updated!");
        setPrefsMessageType("success");
    }
    setIsSubmittingPrefs(false);
  };
  
  // Loading state UI
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-white to-[#f8f9fa]">
        <div className="text-center relative">
          <div className="mb-6 flex items-center justify-center">
            <div className="text-4xl font-extrabold text-[#2c2d5a] tracking-tight">
              Cheap<span className="text-[#ff3366] relative inline-flex">CC
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#ff3366] rounded-full animate-ping opacity-75"></span>
                <span className="absolute -bottom-1 -left-1 w-2 h-2 bg-[#2c2d5a] rounded-full animate-ping opacity-75 animation-delay-500"></span>
              </span>
            </div>
          </div>
          <div className="absolute -top-2 -right-16 transform rotate-12 bg-[#ff3366] text-white text-xs px-3 py-1 rounded-full font-bold shadow-md animate-bounce" style={{ animationDuration: '2s' }}>75% OFF</div>
          <div className="relative h-2 w-48 mx-auto bg-gray-200 rounded-full overflow-hidden mb-4">
            <div className="absolute top-0 left-0 h-full w-1/2 bg-gradient-to-r from-[#2c2d5a] to-[#ff3366] rounded-full animate-[loading_2s_ease-in-out_infinite]"></div>
          </div>
          <h2 className="text-xs font-semibold text-[#2c2d5a] mb-1">Loading creative goodness...</h2>
        </div>
        <style jsx>{` @keyframes loading { 0% { transform: translateX(-100%); } 50% { transform: translateX(100%); } 100% { transform: translateX(-100%); } } .animation-delay-500 { animation-delay: 500ms; } `}</style>
      </div>
    );
  }

  // Helper for message display
  const renderMessage = (message: string, type: string) => {
    if (!message) return null;
    const isSuccess = type === 'success';
    const isWarning = type === 'warning';
    const bgColor = isSuccess ? 'bg-green-50' : isWarning ? 'bg-yellow-50' : 'bg-red-50';
    const textColor = isSuccess ? 'text-green-700' : isWarning ? 'text-yellow-700' : 'text-red-700';
    const icon = isSuccess ? 'fa-check-circle' : isWarning ? 'fa-exclamation-triangle' : 'fa-times-circle';

    return (
      <div className={`text-xs p-2.5 rounded-md flex items-center gap-2 ${bgColor} ${textColor}`}>
        <i className={`fas ${icon}`}></i>
        <span>{message}</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center py-4 px-2 sm:py-6 sm:px-4 mt-10">
      <div className="w-full max-w-xl bg-white rounded-lg shadow-md border border-gray-200 p-4 sm:p-6">
        <h1 className="text-lg font-bold text-[#2c2d5a] mb-4 pb-3 border-b border-gray-200 flex items-center gap-2.5">
          <i className="fas fa-user-cog text-[#ff3366]"></i>
          Account Settings
        </h1>
        
        <div className="space-y-6">
          {/* Personal Information */}
          <form onSubmit={handleProfileUpdate} className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2"><i className="fas fa-id-card text-gray-400"></i>Personal Information</h2>
            <div>
              <label htmlFor="name" className="block text-xs font-medium text-gray-600 mb-1">Full Name</label>
              <input id="name" name="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Enter your full name" className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#ff3366] focus:border-[#ff3366] transition text-[#2c2d5a] text-sm"/>
            </div>
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-gray-600 mb-1">Email Address</label>
              <input id="email" name="email" type="email" value={email} disabled className="w-full px-3 py-1.5 border border-gray-300 rounded-md bg-gray-100 text-gray-500 text-sm cursor-not-allowed"/>
            </div>
            {renderMessage(profileMessage, profileMessageType)}
            <div className="flex justify-end">
              <button type="submit" className="py-1.5 px-4 bg-[#2c2d5a] text-white font-semibold rounded-md hover:bg-[#3e3f7a] transition focus:ring-2 focus:ring-offset-2 focus:ring-[#2c2d5a] disabled:opacity-50 text-xs" disabled={isSubmittingProfile}>
                {isSubmittingProfile ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>

          {/* Separator */}
          <hr className="border-gray-200" />

          {/* Change Password */}
          <form onSubmit={handlePasswordChangeSubmit} className="space-y-3">
             <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2"><i className="fas fa-key text-gray-400"></i>Change Password</h2>
             <div>
                <label htmlFor="newPasswordProfile" className="block text-xs font-medium text-gray-600 mb-1">New Password</label>
                <div className="relative"><input id="newPasswordProfile" name="newPassword" type={showNewPassword ? "text" : "password"} value={newPassword} onChange={(e) => { setNewPassword(e.target.value); setNewPasswordTouched(true); }} required placeholder="Enter new password" className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#ff3366] focus:border-[#ff3366] transition text-[#2c2d5a] pr-10 text-sm"/><button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-700" onClick={() => setShowNewPassword(!showNewPassword)}><i className={`fas ${showNewPassword ? "fa-eye-slash" : "fa-eye"}`}></i></button></div>
                {newPasswordTouched && <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1">{Object.entries(passwordRequirements).map(([key, valid]) => <p key={key} className={`text-xs flex items-center gap-1.5 ${valid ? "text-green-600" : "text-gray-500"}`}><i className={`fas ${valid ? "fa-check-circle" : "fa-times-circle"} fa-xs`}></i>{key.replace(/([A-Z])/g, ' $1').trim()}</p>)}</div>}
             </div>
             <div>
                <label htmlFor="confirmPasswordProfile" className="block text-xs font-medium text-gray-600 mb-1">Confirm New Password</label>
                <div className="relative"><input id="confirmPasswordProfile" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setConfirmPasswordTouched(true); }} required placeholder="Confirm new password" className={`w-full px-3 py-1.5 border rounded-md focus:ring-1 focus:ring-[#ff3366] transition text-[#2c2d5a] pr-10 text-sm ${!passwordsMatch ? "border-red-400 bg-red-50" : "border-gray-300"}`}/><button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-700" onClick={() => setShowConfirmPassword(!showConfirmPassword)}><i className={`fas ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`}></i></button></div>
                {!passwordsMatch && <p className="mt-1 text-xs text-red-600">New passwords do not match.</p>}
            </div>
            {renderMessage(passwordMessage, passwordMessageType)}
            <div className="flex justify-end">
              <button type="submit" className="py-1.5 px-4 bg-[#ff3366] text-white font-semibold rounded-md hover:bg-[#ff6b8b] transition focus:ring-2 focus:ring-offset-2 focus:ring-[#ff3366] disabled:opacity-50 text-xs" disabled={isSubmittingPassword || !isNewPasswordClientValid || !passwordsMatch || !newPassword}>{isSubmittingPassword ? "Updating..." : "Update Password"}</button>
            </div>
          </form>

          {/* Separator */}
          <hr className="border-gray-200" />
          
          {/* Preferences */}
          <form onSubmit={handlePreferencesUpdate} className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2"><i className="fas fa-sliders-h text-gray-400"></i>Preferences</h2>
            <div>
              <label htmlFor="marketingConsent" className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-sm font-medium text-gray-700">Email Marketing</span>
                  <p className="text-xs text-gray-500 font-normal">Receive news, special offers, and tips from CheapCC.</p>
                </div>
                <div className="relative">
                  <input id="marketingConsent" name="marketingConsent" type="checkbox" className="sr-only peer" checked={isSubscribed} onChange={(e) => setIsSubscribed(e.target.checked)}/>
                  <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-offset-2 peer-focus:ring-[#ff3366] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#ff3366]"></div>
                </div>
              </label>
            </div>
            {renderMessage(prefsMessage, prefsMessageType)}
            <div className="flex justify-end">
              <button type="submit" className="py-1.5 px-4 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-700 transition focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 text-xs" disabled={isSubmittingPrefs}>{isSubmittingPrefs ? "Saving..." : "Save Preferences"}</button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}