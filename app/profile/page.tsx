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
  // This effect now ONLY depends on `newPassword`.
  // It will recalculate `passwordRequirements` every time `newPassword` changes.
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
      setNewPasswordTouched(false); // Reset for next time
      setConfirmPasswordTouched(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      // passwordRequirements will update automatically due to newPassword being ""
    }
    setIsSubmittingPassword(false);
  };

  // onChange handler for the "New Password" input field
  const handleNewPasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
    // Set touched to true on the first interaction so the requirements UI becomes visible.
    // It will remain true for subsequent typing in the same session.
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
        
        {/* Savings Tag */}
        <div className="absolute -top-2 -right-16 transform rotate-12 bg-[#ff3366] text-white text-xs px-3 py-1 rounded-full font-bold shadow-md animate-bounce" style={{ animationDuration: '2s' }}>
          75% OFF
        </div>

        {/* Loading Progress Animation */}
        <div className="relative h-2 w-48 mx-auto bg-gray-200 rounded-full overflow-hidden mb-4">
          <div className="absolute top-0 left-0 h-full w-1/2 bg-gradient-to-r from-[#2c2d5a] to-[#ff3366] rounded-full animate-[loading_2s_ease-in-out_infinite]"></div>
        </div>
        
        <h2 className="text-xs font-semibold text-[#2c2d5a] mb-1">Loading creative goodness...</h2>
      </div>
      
      {/* Custom keyframes for the loading animation */}
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
    <div className="profile-page-container">
      <div className="profile-card-container">
        <h1 className="profile-page-title">
          <i className="fas fa-user-cog icon"></i> My Profile
        </h1>

        {/* Personal Information Form */}
        <div className="profile-form-section">
          <h2 className="profile-section-heading">
            <i className="fas fa-id-card icon"></i> Personal Information
          </h2>
          <form onSubmit={handleProfileUpdate} className="profile-form space-y-6">
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
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#ff3366] focus:border-[#ff3366] transition text-[#2c2d5a]"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
              />
              <p className="mt-1 text-xs text-gray-500">Email cannot be changed. Contact support if needed.</p>
            </div>
            {profileMessage && (
              <div className={`profile-message ${profileMessageType}`}>
                <i
                  className={`fas ${
                    profileMessageType === "success"
                      ? "fa-check-circle"
                      : "fa-times-circle"
                  } icon`}
                ></i>
                {profileMessage}
              </div>
            )}
            <div>
              <button
                type="submit"
                className="btn-submit btn-update-profile"
                disabled={isSubmittingProfile}
              >
                {isSubmittingProfile ? "Updating..." : "Update Profile"}
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="profile-form-section">
          <h2 className="profile-section-heading">
            <i className="fas fa-key icon"></i> Change Password
          </h2>
          <form onSubmit={handlePasswordChangeSubmit} className="profile-form space-y-6">
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#ff3366] focus:border-[#ff3366] transition text-[#2c2d5a] pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-700 focus:outline-none"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  <i className={`fas ${showNewPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                </button>
              </div>
              {/* Direct rendering of password requirements, shown if newPasswordTouched is true */}
              {newPasswordTouched && (
                <div className="password-requirements-info mt-2 space-y-0.5">
                  <p className={`requirement text-xs flex items-center gap-1.5 ${passwordRequirements.minLength ? "text-green-600" : "text-red-500"}`}>
                    <i className={`fas ${passwordRequirements.minLength ? "fa-check-circle" : "fa-times-circle"} text-xs`}></i> At least 8 characters
                  </p>
                  <p className={`requirement text-xs flex items-center gap-1.5 ${passwordRequirements.hasUppercase ? "text-green-600" : "text-red-500"}`}>
                    <i className={`fas ${passwordRequirements.hasUppercase ? "fa-check-circle" : "fa-times-circle"} text-xs`}></i> One uppercase letter (A-Z)
                  </p>
                  <p className={`requirement text-xs flex items-center gap-1.5 ${passwordRequirements.hasLowercase ? "text-green-600" : "text-red-500"}`}>
                    <i className={`fas ${passwordRequirements.hasLowercase ? "fa-check-circle" : "fa-times-circle"} text-xs`}></i> One lowercase letter (a-z)
                  </p>
                  <p className={`requirement text-xs flex items-center gap-1.5 ${passwordRequirements.hasNumber ? "text-green-600" : "text-red-500"}`}>
                    <i className={`fas ${passwordRequirements.hasNumber ? "fa-check-circle" : "fa-times-circle"} text-xs`}></i> One number (0-9)
                  </p>
                  <p className={`requirement text-xs flex items-center gap-1.5 ${passwordRequirements.hasSpecialChar ? "text-green-600" : "text-red-500"}`}>
                    <i className={`fas ${passwordRequirements.hasSpecialChar ? "fa-check-circle" : "fa-times-circle"} text-xs`}></i> One special character
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
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setConfirmPasswordTouched(true);
                  }}
                  required
                  placeholder="Confirm new password"
                  className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#ff3366] transition text-[#2c2d5a] pr-10 ${
                    confirmPasswordTouched && !passwordsMatch
                      ? "border-red-500 bg-red-50 focus:border-red-500" // Keep custom validation styles
                      : "border-gray-300 focus:border-[#ff3366]"
                  }`}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-700 focus:outline-none"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <i className={`fas ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                </button>
              </div>
              {confirmPasswordTouched && !passwordsMatch && (
                <p className="input-hint text-xs text-red-600 mt-1">New passwords do not match.</p>
              )}
            </div>
            {passwordMessage && (
              <div className={`profile-message ${passwordMessageType}`}>
                <i
                  className={`fas ${
                    passwordMessageType === "success"
                      ? "fa-check-circle"
                      : passwordMessageType === "warning"
                      ? "fa-exclamation-triangle"
                      : "fa-times-circle"
                  } icon`}
                ></i>
                {passwordMessage}
              </div>
            )}
            <div>
              <button
                type="submit"
                className="btn-submit btn-change-password"
                disabled={
                  isSubmittingPassword ||
                  !newPassword || // Basic check: newPassword should not be empty
                  (newPasswordTouched && (!isNewPasswordClientValid || !passwordsMatch))
                }
              >
                {isSubmittingPassword ? "Changing..." : "Change Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}