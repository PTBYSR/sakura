"use client";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Stack,
  Button,
  Alert,
  Box,
  Avatar,
  Chip,
  CircularProgress,
  Snackbar,
} from "@mui/material";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";

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
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  // If no session, show message
  if (!session) {
    return (
      <PageContainer title="Account Settings" description="Manage your account">
        <Box sx={{ p: 3 }}>
          <Alert severity="warning">Please log in to view account settings.</Alert>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Account Settings" description="Manage your account">
      <Stack spacing={4} sx={{ 
        p: 3,
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
        minWidth: 400,
        maxWidth: 700,
        width: "100%", 
      }}>
        <Typography variant="h5" fontWeight={600}>
          Account Settings
        </Typography>

        {/* Account Details Section */}
        <Card sx={{ width: "100%" }}>
          <CardContent>
            <Stack spacing={3}>
              <Typography variant="h6" sx={{ fontSize: "1.125rem", fontWeight: 600 }}>
                Account Details
              </Typography>
              
              {/* User Avatar and Info */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, pb: 2, borderBottom: 1, borderColor: "divider" }}>
                <Avatar
                  sx={{
                    width: 56,
                    height: 56,
                    bgcolor: "primary.main",
                    fontSize: "20px",
                  }}
                >
                  {session?.user?.name?.charAt(0).toUpperCase() || session?.user?.email?.charAt(0).toUpperCase() || "U"}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontSize: "1rem", fontWeight: 600 }}>
                    {session?.user?.name || "User"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.875rem" }}>
                    {session?.user?.email || "No email"}
                  </Typography>
                </Box>
                <Chip
                  label="Active"
                  color="success"
                  size="small"
                  sx={{ fontSize: "0.75rem" }}
                />
              </Box>

              {/* User ID Info */}
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.875rem" }}>
                  User ID: {session?.user?.id || "N/A"}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

      {/* Profile Information */}
      <Card sx={{ width: "100%" }}>
        <CardContent>
          <Stack spacing={2.5}>
            <Typography variant="h6" sx={{ fontSize: "1.125rem", fontWeight: 600 }}>
              Profile Information
            </Typography>

            <TextField
              label="Full Name"
              fullWidth
              size="small"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              sx={{ "& .MuiInputBase-input": { fontSize: "0.875rem" } }}
            />

            <TextField
              label="Email"
              fullWidth
              size="small"
              value={email}
              disabled
              helperText="Email cannot be changed"
              sx={{ 
                "& .MuiInputBase-input": { fontSize: "0.875rem" },
                "& .MuiFormHelperText-root": { fontSize: "0.75rem" }
              }}
            />

            <Button
              variant="contained"
              size="small"
              onClick={handleSave}
              disabled={saving}
              sx={{ 
                alignSelf: "flex-start",
                fontSize: "0.875rem",
                mt: 1
              }}
            >
              {saving ? <CircularProgress size={20} /> : "Save Changes"}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card sx={{ width: "100%" }}>
        <CardContent>
          <Stack spacing={2.5}>
            <Typography variant="h6" sx={{ fontSize: "1.125rem", fontWeight: 600 }}>
              Change Password
            </Typography>
            <TextField
              type="password"
              label="Current Password"
              fullWidth
              size="small"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              sx={{ "& .MuiInputBase-input": { fontSize: "0.875rem" } }}
            />
            <TextField
              type="password"
              label="New Password"
              fullWidth
              size="small"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              helperText="Password must be at least 8 characters long"
              sx={{ 
                "& .MuiInputBase-input": { fontSize: "0.875rem" },
                "& .MuiFormHelperText-root": { fontSize: "0.75rem" }
              }}
            />
            <TextField
              type="password"
              label="Confirm New Password"
              fullWidth
              size="small"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              sx={{ "& .MuiInputBase-input": { fontSize: "0.875rem" } }}
            />
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={handleChangePassword}
              disabled={passwordChanging}
              sx={{ 
                alignSelf: "flex-start",
                fontSize: "0.875rem",
                mt: 1
              }}
            >
              {passwordChanging ? <CircularProgress size={20} /> : "Update Password"}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      </Stack>
    </PageContainer>
  );
}
