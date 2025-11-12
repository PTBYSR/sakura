"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Chip } from "@/components/ui/chip";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

export default function AccountSettingsPage() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  
  // Profile states - initialized from session
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [passwordChanging, setPasswordChanging] = useState(false);
  
  // Password change states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Snackbar states
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    // Check authentication
    if (!isPending && !session) {
      router.push("/authentication/login");
      return;
    }

    // Initialize form data from session
    if (session?.user) {
      setFullName(session.user.name || "");
      setEmail(session.user.email || "");
    }
  }, [session, isPending, router]);

  const handleSave = async () => {
    if (!session?.user) return;
    
    setSaving(true);
    try {
      // Update user profile using better-auth
      const { error } = await authClient.updateUser({
        name: fullName,
      });

      if (error) {
        throw new Error(error.message || "Failed to update profile");
      }

      setSnackbar({
        open: true,
        message: "Profile updated successfully!",
        severity: "success",
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || "Failed to update profile",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setSnackbar({
        open: true,
        message: "Please fill in all password fields",
        severity: "error",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setSnackbar({
        open: true,
        message: "New passwords do not match!",
        severity: "error",
      });
      return;
    }

    if (newPassword.length < 8) {
      setSnackbar({
        open: true,
        message: "Password must be at least 8 characters long",
        severity: "error",
      });
      return;
    }

    setPasswordChanging(true);
    try {
      // Use better-auth changePassword method
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
      });

      if (error) {
        throw new Error(error.message || "Failed to change password");
      }

      setSnackbar({
        open: true,
        message: "Password changed successfully!",
        severity: "success",
      });

      // Clear password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || "Failed to change password",
        severity: "error",
      });
    } finally {
      setPasswordChanging(false);
    }
  };

  // Show loading state
  if (isPending) {
    return (
      <PageContainer title="Account Settings" description="Manage your account">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-[#EE66AA]" />
        </div>
      </PageContainer>
    );
  }

  // If no session, show message
  if (!session) {
    return (
      <PageContainer title="Account Settings" description="Manage your account">
        <div className="p-6">
          <div className="p-4 bg-yellow-600/20 border border-yellow-500 rounded-lg text-yellow-400">
            Please log in to view account settings.
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Account Settings" description="Manage your account">
      <div className="flex flex-col items-center p-4 sm:p-6 min-w-0 sm:min-w-[400px] max-w-[700px] w-full gap-8">
        <h2 className="text-2xl font-semibold text-white">
          Account Settings
        </h2>

        {/* Account Details Section */}
        <Card className="w-full">
          <CardContent className="p-6">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">
                Account Details
              </h3>
              
              {/* User Avatar and Info */}
              <div className="flex items-center gap-4 pb-4 border-b border-gray-700">
                <div className="w-14 h-14 rounded-full bg-[#EE66AA] flex items-center justify-center text-white text-xl font-semibold">
                  {session?.user?.name?.charAt(0).toUpperCase() || session?.user?.email?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-semibold text-white">
                    {session?.user?.name || "User"}
                  </h4>
                  <p className="text-sm text-gray-300">
                    {session?.user?.email || "No email"}
                  </p>
                </div>
                <Chip
                  label="Active"
                  color="success"
                  size="small"
                  className="text-xs"
                />
              </div>

              {/* User ID Info */}
              <div>
                <p className="text-sm text-gray-300">
                  User ID: {session?.user?.id || "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

      {/* Profile Information */}
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-white">
              Profile Information
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Full Name
              </label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <Input
                value={email}
                disabled
                className="w-full"
              />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
            </div>

            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={handleSave}
              disabled={saving}
              className="self-start text-sm mt-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-white">
              Change Password
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Current Password
              </label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                New Password
              </label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-gray-400 mt-1">Password must be at least 8 characters long</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Confirm New Password
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full"
              />
            </div>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={handleChangePassword}
              disabled={passwordChanging}
              className="self-start text-sm mt-2"
            >
              {passwordChanging ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Update Password
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Snackbar for notifications */}
      {snackbar.open && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className={`p-4 rounded-lg shadow-lg ${
            snackbar.severity === "success" 
              ? "bg-green-600/20 border border-green-500 text-green-400" 
              : "bg-red-600/20 border border-red-500 text-red-400"
          }`}>
            <div className="flex items-center gap-3">
              {snackbar.severity === "success" ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
              <span>{snackbar.message}</span>
              <button
                onClick={() => setSnackbar({ ...snackbar, open: false })}
                className="ml-4 text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </PageContainer>
  );
}
