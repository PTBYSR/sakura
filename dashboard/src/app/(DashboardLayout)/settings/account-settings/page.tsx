"use client";
import React, { useState } from "react";
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
} from "@mui/material";

export default function AccountSettingsPage() {
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

  return (
    <Stack spacing={4} sx={{ 
      p: 3,
      display: "flex",
    alignItems: "center",
    flexDirection: "column",
    minWidth: 400,   // ensures card never shrinks too small
    maxWidth: 700,   // prevents card from stretching too wide
    width: "100%", 
      
      
      }}>
      <Typography variant="h5" fontWeight={600}>
        Account Settings
      </Typography>

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
              value={fullName}
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
  );
}
