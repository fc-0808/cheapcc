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

  // Current password is not needed for supabase.auth.updateUser({password: newPassword})
  // const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [newPasswordTouched, setNewPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
  const passwordsMatch = newPassword === confirmPassword || !confirmPasswordTouched; // Simplified match logic

  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  const isNewPasswordClientValid = Object.values(passwordRequirements).every((req) => req);

  const router = useRouter();
  const supabase = createClient();

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

  useEffect(() => {
    if (newPasswordTouched) {
      setPasswordRequirements({
        minLength: newPassword.length >= 8,
        hasUppercase: /[A-Z]/.test(newPassword),
        hasLowercase: /[a-z]/.test(newPassword),
        hasNumber: /[0-9]/.test(newPassword),
        hasSpecialChar: /[^a-zA-Z0-9]/.test(newPassword),
      });
    } else {
      // Reset if password field is cleared
      setPasswordRequirements({ minLength: false, hasUppercase: false, hasLowercase: false, hasNumber: false, hasSpecialChar: false });
    }
  }, [newPassword, newPasswordTouched]);


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
    const result = await updateProfile(formData); // Call server action

    if (result.error) {
      setProfileMessage(result.error);
      setProfileMessageType("error");
    } else if (result.success) {
      setProfileMessage(result.message || "Profile updated successfully!");
      setProfileMessageType("success");
      // Optionally re-fetch profile or update name state if server action doesn't revalidate enough
    }
    setIsSubmittingProfile(false);
  };

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
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
    // currentPassword is not needed for this server action
    // formData.append('currentPassword', currentPassword);
    formData.append('newPassword', newPassword);
    formData.append('confirmPassword', confirmPassword);

    const result = await changeUserPasswordOnProfile(formData); // Call server action

    if (result.error) {
      setPasswordMessage(result.error);
      setPasswordMessageType("error");
    } else if (result.success) {
      setPasswordMessage(result.message || "Password changed successfully!");
      setPasswordMessageType("success");
      // Clear password fields
      // setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setNewPasswordTouched(false);
      setConfirmPasswordTouched(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    }
    setIsSubmittingPassword(false);
  };

  const PasswordRequirementItem: React.FC<{ met: boolean; text: string }> = ({ met, text }) => (
    <p className={`requirement text-xs flex items-center gap-1.5 ${met ? "text-green-600" : "text-red-500"}`}>
      <i className={`fas ${met ? "fa-check-circle" : "fa-times-circle"} text-xs`}></i> {text}
    </p>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff3366]"></div>
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
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                name="name" // Name attribute for FormData
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <label htmlFor="email">Email Address</label>
              <input id="email" type="email" value={email} disabled />
              <p className="input-hint text-xs text-gray-500 mt-1">Email address cannot be changed here.</p>
            </div>
            {profileMessage && (
              <div className={`profile-message ${profileMessageType}`}>
                <i
                  className={`fas ${
                    profileMessageType === "success"
                      ? "fa-check-circle"
                      : "fa-exclamation-triangle"
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
          <form onSubmit={handlePasswordChange} className="profile-form space-y-6">
            {/* Current Password field - Supabase doesn't require it for updateUser password change
            <div>
              <label htmlFor="currentPassword">Current Password</label>
              <div className="password-input-wrapper">
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="Enter your current password"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  <i className={`fas ${showCurrentPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                </button>
              </div>
            </div>
            */}
            <div>
              <label htmlFor="newPassword">New Password</label>
              <div className="password-input-wrapper">
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setNewPasswordTouched(true);
                  }}
                  required
                  placeholder="Enter new password"
                  className={`password-input-field ${
                    newPasswordTouched && !isNewPasswordClientValid
                      ? "border-yellow-500 focus:border-yellow-500 bg-yellow-50"
                      : ""
                  }`}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  <i className={`fas ${showNewPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                </button>
              </div>
              {newPasswordTouched && (
                <div className="password-requirements-info mt-2 space-y-0.5">
                  <PasswordRequirementItem
                    met={passwordRequirements.minLength}
                    text="At least 8 characters"
                  />
                  <PasswordRequirementItem
                    met={passwordRequirements.hasUppercase}
                    text="One uppercase letter (A-Z)"
                  />
                  <PasswordRequirementItem
                    met={passwordRequirements.hasLowercase}
                    text="One lowercase letter (a-z)"
                  />
                   <PasswordRequirementItem
                    met={passwordRequirements.hasNumber}
                    text="One number (0-9)"
                  />
                   <PasswordRequirementItem
                    met={passwordRequirements.hasSpecialChar}
                    text="One special character"
                  />
                </div>
              )}
            </div>
            <div>
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <div className="password-input-wrapper">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setConfirmPasswordTouched(true);
                  }}
                  required
                  placeholder="Confirm new password"
                  className={`password-input-field ${
                    confirmPasswordTouched && !passwordsMatch
                      ? "border-red-500 focus:border-red-500 bg-red-50"
                      : ""
                  }`}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
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
                      : "fa-times-circle" // Use times-circle for errors
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
                  !newPassword || // Ensure new password is not empty
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