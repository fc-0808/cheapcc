// app/profile/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/supabase-client";
import { updateProfile, changeUserPasswordOnProfile } from "./actions"; // Import server actions

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  const [profileMessage, setProfileMessage] = useState("");
  const [profileMessageType, setProfileMessageType] = useState<"success" | "error" | "">("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordMessageType, setPasswordMessageType] = useState<"success" | "error" | "warning" | "">("");

  // State for the new password form
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newPasswordTouched, setNewPasswordTouched] = useState(false); // To show requirements after first interaction
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);

  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  const isNewPasswordClientValid = Object.values(passwordRequirements).every((req) => req);
  const passwordsMatch = newPassword === confirmPassword || !confirmPasswordTouched; // Used for confirm password validation

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
        .select("name")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        setProfileMessage(`Failed to load profile: ${profileError.message}`);
        setProfileMessageType("error");
      }
      setName(profileData?.name || user.user_metadata?.name || user.email?.split("@")[0] || "");
      setIsLoading(false);
    }
    loadProfile();
  }, [router, supabase]);

  // CRITICAL: useEffect for password strength calculation
  useEffect(() => {
    setPasswordRequirements({
      minLength: newPassword.length >= 8,
      hasUppercase: /[A-Z]/.test(newPassword),
      hasLowercase: /[a-z]/.test(newPassword),
      hasNumber: /[0-9]/.test(newPassword),
      hasSpecialChar: /[^a-zA-Z0-9]/.test(newPassword),
    });
  }, [newPassword]);

  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) {
      setProfileMessage("Name cannot be empty.");
      setProfileMessageType("error");
      return;
    }
    setIsSubmittingProfile(true);
    setProfileMessage("");
    setProfileMessageType("");

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
    setPasswordMessage("");
    setPasswordMessageType("");

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
    const formData = new FormData(e.currentTarget);
    formData.append('newPassword', newPassword);
    formData.append('confirmPassword', confirmPassword);

    const result = await changeUserPasswordOnProfile(formData);

    if (result.error) {
      setPasswordMessage(result.error);
      setPasswordMessageType("error");
    } else if (result.success) {
      setPasswordMessage(result.message || "Password changed successfully!");
      setPasswordMessageType("success");
      setNewPassword("");
      setConfirmPassword("");
      setNewPasswordTouched(false);
      setConfirmPasswordTouched(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    }
    setIsSubmittingPassword(false);
  };
  
  const handleNewPasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
    if (!newPasswordTouched) {
      setNewPasswordTouched(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-white to-[#f8f9fa]">
      <div className="text-center relative">
        {/* Logo Animation */}
        <div className="mb-6 flex items-center justify-center">
          <div className="text-4xl font-extrabold text-[#2c2d5a] tracking-tight">
            Cheap
            <span className="text-[#ff3366] relative inline-flex">
              CC
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#ff3366] rounded-full animate-ping opacity-75"></span>
              <span className="absolute -bottom-1 -left-1 w-2 h-2 bg-[#2c2d5a] rounded-full animate-ping opacity-75 animation-delay-500"></span>
            </span>
          </div>
        </div>
        
        <div className="absolute -top-2 -right-16 transform rotate-12 bg-[#ff3366] text-white text-xs px-3 py-1 rounded-full font-bold shadow-md animate-bounce" style={{ animationDuration: '2s' }}>
          75% OFF
        </div>

        <div className="relative h-2 w-48 mx-auto bg-gray-200 rounded-full overflow-hidden mb-4">
          <div className="absolute top-0 left-0 h-full w-1/2 bg-gradient-to-r from-[#2c2d5a] to-[#ff3366] rounded-full animate-[loading_2s_ease-in-out_infinite]"></div>
        </div>
        
        <h2 className="text-xs font-semibold text-[#2c2d5a] mb-1">Loading creative goodness...</h2>
      </div>
      
      <style jsx>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animation-delay-500 {
          animation-delay: 500ms;
        }
      `}</style>
    </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-6 px-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg border border-gray-100 p-6 sm:p-8">
        <h1 className="text-xl sm:text-2xl font-bold text-[#2c2d5a] mb-6 pb-3 border-b border-gray-200 flex items-center gap-3">
          <i className="fas fa-user-cog text-[#ff3366]"></i>
          My Profile
        </h1>
        
        <div className="space-y-6">
          {/* Personal Information Form */}
          <div className="profile-form-section bg-gray-50/50 p-4 rounded-lg border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
              <i className="fas fa-id-card text-gray-400"></i>
              Personal Information
            </h2>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Enter your full name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#ff3366] focus:border-[#ff3366] transition text-[#2c2d5a] text-sm"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 text-sm cursor-not-allowed"
                />
              </div>
              {profileMessage && (
                <div className={`text-xs p-3 rounded-md flex items-center gap-2 ${profileMessageType === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  <i className={`fas ${profileMessageType === "success" ? "fa-check-circle" : "fa-times-circle"}`}></i>
                  {profileMessage}
                </div>
              )}
              <div>
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-[#2c2d5a] text-white font-semibold rounded-md hover:bg-[#3e3f7a] transition focus:ring-2 focus:ring-[#ff3366] focus:outline-none disabled:opacity-50 text-sm"
                  disabled={isSubmittingProfile}
                >
                  {isSubmittingProfile ? "Updating..." : "Update Profile"}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="profile-form-section bg-gray-50/50 p-4 rounded-lg border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
              <i className="fas fa-key text-gray-400"></i>
              Change Password
            </h2>
            <form onSubmit={handlePasswordChangeSubmit} className="space-y-4">
              <div>
                <label htmlFor="newPasswordProfile" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <div className="relative">
                  <input
                    id="newPasswordProfile"
                    name="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={handleNewPasswordInputChange}
                    required
                    placeholder="Enter new password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#ff3366] focus:border-[#ff3366] transition text-[#2c2d5a] pr-10 text-sm"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-700"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    <i className={`fas ${showNewPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                  </button>
                </div>
                {newPasswordTouched && (
                  <div className="mt-1.5 space-y-0.5">
                    <p className={`text-xs flex items-center gap-1.5 ${passwordRequirements.minLength ? "text-green-600" : "text-gray-500"}`}>
                      <i className={`fas ${passwordRequirements.minLength ? "fa-check-circle" : "fa-times-circle"} fa-xs`}></i> At least 8 characters
                    </p>
                    <p className={`text-xs flex items-center gap-1.5 ${passwordRequirements.hasUppercase ? "text-green-600" : "text-gray-500"}`}>
                      <i className={`fas ${passwordRequirements.hasUppercase ? "fa-check-circle" : "fa-times-circle"} fa-xs`}></i> One uppercase letter
                    </p>
                    <p className={`text-xs flex items-center gap-1.5 ${passwordRequirements.hasLowercase ? "text-green-600" : "text-gray-500"}`}>
                      <i className={`fas ${passwordRequirements.hasLowercase ? "fa-check-circle" : "fa-times-circle"} fa-xs`}></i> One lowercase letter
                    </p>
                    <p className={`text-xs flex items-center gap-1.5 ${passwordRequirements.hasNumber ? "text-green-600" : "text-gray-500"}`}>
                      <i className={`fas ${passwordRequirements.hasNumber ? "fa-check-circle" : "fa-times-circle"} fa-xs`}></i> One number
                    </p>
                    <p className={`text-xs flex items-center gap-1.5 ${passwordRequirements.hasSpecialChar ? "text-green-600" : "text-gray-500"}`}>
                      <i className={`fas ${passwordRequirements.hasSpecialChar ? "fa-check-circle" : "fa-times-circle"} fa-xs`}></i> One special character
                    </p>
                  </div>
                )}
              </div>
              <div>
                <label htmlFor="confirmPasswordProfile" className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <div className="relative">
                  <input
                    id="confirmPasswordProfile"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setConfirmPasswordTouched(true); }}
                    required
                    placeholder="Confirm new password"
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#ff3366] transition text-[#2c2d5a] pr-10 text-sm ${!passwordsMatch ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-700"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <i className={`fas ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                  </button>
                </div>
                {!passwordsMatch && (
                  <p className="mt-1 text-xs text-red-600">New passwords do not match.</p>
                )}
              </div>
              {passwordMessage && (
                <div className={`text-xs p-3 rounded-md flex items-center gap-2 ${
                  passwordMessageType === "success" ? "bg-green-50 text-green-700" :
                  passwordMessageType === "warning" ? "bg-yellow-50 text-yellow-700" :
                  "bg-red-50 text-red-700"
                }`}>
                  <i className={`fas ${
                    passwordMessageType === "success" ? "fa-check-circle" :
                    passwordMessageType === "warning" ? "fa-exclamation-triangle" : "fa-times-circle"
                  }`}></i>
                  {passwordMessage}
                </div>
              )}
              <div>
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-[#ff3366] text-white font-semibold rounded-md hover:bg-[#ff6b8b] transition focus:ring-2 focus:ring-[#2c2d5a] focus:outline-none disabled:opacity-50 text-sm"
                  disabled={isSubmittingPassword || !isNewPasswordClientValid || !passwordsMatch || !newPassword}
                >
                  {isSubmittingPassword ? "Changing..." : "Change Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}