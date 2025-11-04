"use client";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Stack,
  Button,
  Divider,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  Box,
  Avatar,
  Chip,
  CircularProgress,
} from "@mui/material";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";

export default function AccountSettingsPage() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  // States
  const [fullName, setFullName] = useState("OpenSea Support");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("pasetechnologies@gmail.com");
  const [vat, setVat] = useState("");
  const [address, setAddress] = useState("");
  const [language, setLanguage] = useState("English");
  const [availability, setAvailability] = useState("always");
  const [timeFormat, setTimeFormat] = useState("12");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accountStatus, setAccountStatus] = useState<"active" | "inactive" | "pending">("active");

  useEffect(() => {
    // Check authentication
    if (!isPending && !session) {
      router.push("/authentication/login");
      return;
    }

    // Set account status based on session
    if (session?.user) {
      // In a real app, you'd fetch this from the backend
      setAccountStatus("active");
    }
  }, [session, isPending, router]);

  const handleSave = () => {
    console.log({
      fullName,
      companyName,
      email,
      vat,
      address,
      language,
      availability,
      timeFormat,
    });
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
    console.log({ currentPassword, newPassword });
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

        {/* Account Details and Status Section */}
        <Card sx={{ width: "100%" }}>
          <CardContent>
            <Stack spacing={3}>
              <Typography variant="h6">Account Details</Typography>
              
              {/* User Avatar and Info */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, pb: 2, borderBottom: 1, borderColor: "divider" }}>
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    bgcolor: "primary.main",
                    fontSize: "24px",
                  }}
                >
                  {session?.user?.name?.charAt(0).toUpperCase() || session?.user?.email?.charAt(0).toUpperCase() || "U"}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6">{session?.user?.name || "User"}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {session?.user?.email || "No email"}
                  </Typography>
                </Box>
                <Chip
                  label={accountStatus.charAt(0).toUpperCase() + accountStatus.slice(1)}
                  color={accountStatus === "active" ? "success" : accountStatus === "pending" ? "warning" : "default"}
                  sx={{ textTransform: "capitalize" }}
                />
              </Box>

              {/* Account Status Info */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Account Status
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {accountStatus === "active" 
                    ? "Your account is active and fully functional." 
                    : accountStatus === "pending"
                    ? "Your account is pending verification."
                    : "Your account is currently inactive."}
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  <Chip 
                    label={`User ID: ${session?.user?.id?.substring(0, 8) || "N/A"}`}
                    size="small"
                    variant="outlined"
                  />
                  <Chip 
                    label="Role: User"
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </Box>
            </Stack>
          </CardContent>
        </Card>

      {/* Profile Info */}
      <Card
       sx={{
    p: 2,
      // makes it responsive within grid
  }}
      >
        <CardContent>
          <Stack spacing={3}>
            <Typography variant="h6">Profile Information</Typography>

            <TextField
              label="Full Name (Will be displayed to your visitors)"
              fullWidth
              value={fullName || session?.user?.name || ""}
              onChange={(e) => setFullName(e.target.value)}
            />

            <TextField
              label="Company Name"
              fullWidth
              placeholder="Enter your company name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />

            <TextField
              label="Email"
              fullWidth
              value={email || session?.user?.email || ""}
              onChange={(e) => setEmail(e.target.value)}
              disabled
              helperText="Email cannot be changed"
            />

            <TextField
              label="VAT"
              fullWidth
              placeholder="Enter your VAT"
              value={vat}
              onChange={(e) => setVat(e.target.value)}
            />

            <TextField
              label="Address"
              fullWidth
              placeholder="Enter your address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />

            <FormControl fullWidth>
              <InputLabel>Preferred Chat Language</InputLabel>
              <Select
                value={language}
                label="Preferred Chat Language"
                onChange={(e) => setLanguage(e.target.value)}
              >
                <MenuItem value="English">English</MenuItem>
                <MenuItem value="Spanish">Spanish</MenuItem>
                <MenuItem value="French">French</MenuItem>
              </Select>
            </FormControl>
            <Alert severity="info">
              Changing the preferred chat language affects the whole team.
            </Alert>

            <FormControl>
              <Typography variant="subtitle2">Availability</Typography>
              <RadioGroup
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
              >
                <FormControlLabel
                  value="always"
                  control={<Radio />}
                  label="Always online"
                />
                <FormControlLabel
                  value="custom"
                  control={<Radio />}
                  label="Set custom availability"
                />
              </RadioGroup>
            </FormControl>

            <FormControl>
              <Typography variant="subtitle2">
                Format for displaying hours in timestamp
              </Typography>
              <RadioGroup
                value={timeFormat}
                onChange={(e) => setTimeFormat(e.target.value)}
              >
                <FormControlLabel
                  value="12"
                  control={<Radio />}
                  label="12 hour format"
                />
                <FormControlLabel
                  value="24"
                  control={<Radio />}
                  label="24 hour format"
                />
              </RadioGroup>
            </FormControl>
            <Alert severity="info">
              Your team and visitors will view the time in this format. Only the
              account owner can update the timestamp format.
            </Alert>

            <Button
              variant="contained"
              size="large"
              onClick={handleSave}
              sx={{ alignSelf: "flex-start" }}
            >
              Save Changes
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card
      sx={{
        width: "100%",
      }}
      >
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h6">Change Password</Typography>
            <TextField
              type="password"
              label="Current Password"
              fullWidth
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <TextField
              type="password"
              label="New Password"
              fullWidth
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <TextField
              type="password"
              label="Confirm New Password"
              fullWidth
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <Button
              variant="contained"
              color="secondary"
              size="large"
              onClick={handleChangePassword}
              sx={{ alignSelf: "flex-start", mt: 1 }}
            >
              Update Password
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Delete Account */}
      <Card
      sx={{
        width: "100%",
      }}
      
      >
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h6" color="error">
              Delete Account
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Deleting your account will permanently remove all data and cannot
              be undone.
            </Typography>
            <Button variant="contained" color="error" sx={{ alignSelf: "flex-start" }}>
              Delete Account
            </Button>
          </Stack>
        </CardContent>
      </Card>
      </Stack>
    </PageContainer>
  );
}
