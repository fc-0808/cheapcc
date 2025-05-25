"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/supabase-client";

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [profileMessage, setProfileMessage] = useState("");
  const [profileMessageType, setProfileMessageType] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordMessageType, setPasswordMessageType] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [newPasswordTouched, setNewPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);

  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
  });

  const isNewPasswordValid = Object.values(passwordRequirements).every((req) => req);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadProfile() {
      try {
        setIsLoading(true);
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

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
          setName(user.user_metadata?.name || user.email?.split("@")[0] || "");
          return;
        }

        setName(profileData?.name || user.user_metadata?.name || user.email?.split("@")[0] || "");
      } catch (error) {
        setProfileMessage("An error occurred while loading your profile.");
        setProfileMessageType("error");
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, [router, supabase]);

  useEffect(() => {
    if (newPasswordTouched) {
      setPasswordRequirements({
        minLength: newPassword.length >= 8,
        hasUppercase: /[A-Z]/.test(newPassword),
        hasLowercase: /[a-z]/.test(newPassword),
      });
    } else {
      setPasswordRequirements({ minLength: false, hasUppercase: false, hasLowercase: false });
    }
  }, [newPassword, newPasswordTouched]);

  useEffect(() => {
    if (confirmPasswordTouched) {
      setPasswordsMatch(newPassword === confirmPassword);
    } else {
      setPasswordsMatch(true);
    }
  }, [newPassword, confirmPassword, confirmPasswordTouched]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setProfileMessage("Name cannot be empty.");
      setProfileMessageType("error");
      return;
    }
    setIsSubmitting(true);
    setProfileMessage("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ name, updated_at: new Date().toISOString() })
        .eq("id", user.id);
      if (profileError) throw profileError;

      const { error: metadataError } = await supabase.auth.updateUser({ data: { name } });
      if (metadataError) console.warn("Failed to update user metadata:", metadataError);

      setProfileMessage("Profile updated successfully!");
      setProfileMessageType("success");
    } catch (error: any) {
      setProfileMessage(error.message || "Failed to update profile.");
      setProfileMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessage("All password fields are required.");
      setPasswordMessageType("error");
      return;
    }
    if (!isNewPasswordValid) {
      setPasswordMessage("New password does not meet all requirements.");
      setPasswordMessageType("warning");
      return;
    }
    if (!passwordsMatch) {
      setPasswordMessage("New passwords do not match.");
      setPasswordMessageType("error");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        if (error.message.includes("password should be different")) {
          setPasswordMessage("New password must be different from the current password.");
        } else if (
          error.message.toLowerCase().includes("old password") ||
          error.message.toLowerCase().includes("current password")
        ) {
          setPasswordMessage("Current password is incorrect or verification failed.");
        } else {
          setPasswordMessage(error.message || "Failed to update password.");
        }
        setPasswordMessageType("error");
        return;
      }

      setPasswordMessage("Password changed successfully!");
      setPasswordMessageType("success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setNewPasswordTouched(false);
      setConfirmPasswordTouched(false);
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (error: any) {
      setPasswordMessage(error.message || "An unexpected error occurred.");
      setPasswordMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const PasswordRequirementItem: React.FC<{ met: boolean; text: string }> = ({ met, text }) => (
    <p className={`requirement${met ? " met" : ""}`}>
      <i className={`fas ${met ? "fa-check-circle" : "fa-times-circle"} icon`}></i> {text}
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

        <div className="profile-form-section">
          <h2 className="profile-section-heading">
            <i className="fas fa-id-card icon"></i> Personal Information
          </h2>
          <form onSubmit={handleProfileUpdate} className="profile-form space-y-6">
            <div>
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
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
              <p className="input-hint">Email address cannot be changed.</p>
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
                disabled={isSubmitting}
              >
                {isSubmitting ? "Updating..." : "Update Profile"}
              </button>
            </div>
          </form>
        </div>

        <div className="profile-form-section">
          <h2 className="profile-section-heading">
            <i className="fas fa-key icon"></i> Change Password
          </h2>
          <form onSubmit={handlePasswordChange} className="profile-form space-y-6">
            <div>
              <label htmlFor="currentPassword">Current Password</label>
              <div className="password-input-wrapper">
                <input
                  id="currentPassword"
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
            <div>
              <label htmlFor="newPassword">New Password</label>
              <div className="password-input-wrapper">
                <input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setNewPasswordTouched(true);
                  }}
                  required
                  placeholder="Enter new password"
                  className={
                    newPasswordTouched && !isNewPasswordValid
                      ? "border-yellow-500 focus:border-yellow-500"
                      : ""
                  }
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
                <div className="password-requirements-info">
                  <p className="heading">Password must contain:</p>
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
                </div>
              )}
            </div>
            <div>
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <div className="password-input-wrapper">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setConfirmPasswordTouched(true);
                  }}
                  required
                  placeholder="Confirm new password"
                  className={
                    confirmPasswordTouched && !passwordsMatch
                      ? "border-red-500 focus:border-red-500"
                      : ""
                  }
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
                <p className="input-hint text-red-600 mt-1">Passwords do not match.</p>
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
                  isSubmitting ||
                  (newPasswordTouched && (!isNewPasswordValid || (confirmPasswordTouched && !passwordsMatch)))
                }
              >
                {isSubmitting ? "Changing..." : "Change Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 