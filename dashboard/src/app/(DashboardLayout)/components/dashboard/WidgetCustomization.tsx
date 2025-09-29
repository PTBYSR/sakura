"use client";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Stack,
  Avatar,
  IconButton,
  Button,
  Switch,
  FormControlLabel,
  ToggleButton,
  ToggleButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormGroup,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Upload, Delete } from "@mui/icons-material";


// 🔹 Reusable Section Card
function SectionCard({
  title,
  description,
  onConfigure,
}: {
  title: string;
  description: string;
  onConfigure: () => void;
}) {
  return (
    <Card variant="outlined" sx={{ mb: 3 }}>
      <CardContent>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack spacing={0.5}>
            <Typography variant="subtitle1" fontWeight={600}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          </Stack>
          <Button variant="outlined" onClick={onConfigure}>
            Configure
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}


// 🔹 Additional Customization Sections (popups)
function AdvancedCustomization() {
  const [openDialog, setOpenDialog] = useState<null | string>(null);
  const handleOpen = (section: string) => setOpenDialog(section);
  const handleClose = () => setOpenDialog(null);

  return (
    <Stack spacing={3} mt={4}>
      <Typography variant="h6" fontWeight={600}>
        Advanced Customization
      </Typography>

      <SectionCard
        title="Collect Visitor's Info"
        description="Choose which fields you want to collect from visitors."
        onConfigure={() => handleOpen("collectInfo")}
      />

      <SectionCard
        title="Select Fields"
        description="Customize which form fields are visible to users."
        onConfigure={() => handleOpen("selectFields")}
      />

      <SectionCard
        title="Frequently Asked Questions"
        description="Enable or disable quick FAQs for your visitors."
        onConfigure={() => handleOpen("faqs")}
      />

      <SectionCard
        title="Social Chat Channels"
        description="Add buttons for WhatsApp, Messenger, and more."
        onConfigure={() => handleOpen("social")}
      />

      <SectionCard
        title="Custom Visibility"
        description="Set rules for when and where the widget is visible."
        onConfigure={() => handleOpen("visibility")}
      />

      {/* ===================== Dialogs ===================== */}

      {/* Collect Info */}
      <Dialog open={openDialog === "collectInfo"} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Collect Visitor`&lsquo`s Info</DialogTitle>
        <DialogContent dividers>
          <FormGroup>
            {["Name", "Email", "Phone", "Company"].map((field) => (
              <FormControlLabel key={field} control={<Checkbox defaultChecked />} label={field} />
            ))}
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleClose}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Select Fields */}
      <Dialog open={openDialog === "selectFields"} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Select Fields</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField fullWidth label="Custom Field Name" />
            <TextField fullWidth label="Placeholder" />
            <FormControlLabel control={<Switch />} label="Required" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleClose}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* FAQs */}
      <Dialog open={openDialog === "faqs"} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Frequently Asked Questions</DialogTitle>
        <DialogContent dividers>
          <FormControlLabel control={<Switch defaultChecked />} label="Enable FAQs" />
          <Stack spacing={2} mt={2}>
            <TextField fullWidth label="Question" />
            <TextField fullWidth multiline rows={3} label="Answer" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleClose}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Social Channels */}
      <Dialog open={openDialog === "social"} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Social Chat Channels</DialogTitle>
        <DialogContent dividers>
          <FormGroup>
            <FormControlLabel control={<Switch />} label="WhatsApp" />
            <FormControlLabel control={<Switch />} label="Messenger" />
            <FormControlLabel control={<Switch />} label="Telegram" />
            <FormControlLabel control={<Switch />} label="Instagram" />
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleClose}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Visibility */}
      <Dialog open={openDialog === "visibility"} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Custom Visibility</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <FormControlLabel control={<Switch defaultChecked />} label="Show on Desktop" />
            <FormControlLabel control={<Switch defaultChecked />} label="Show on Mobile" />
            <TextField fullWidth label="Pages to Include (comma separated)" />
            <TextField fullWidth label="Pages to Exclude (comma separated)" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleClose}>Save</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}


// 🔹 Main Widget Customization Page
export default function WidgetCustomization() {
  const theme = useTheme();

  // States
  const [headerText, setHeaderText] = useState("👋 Our team is here for you");
  const [widgetIcon, setWidgetIcon] = useState("chat-bubble");
  const [logo, setLogo] = useState<string | null>(null);
  const [color, setColor] = useState("#1976d2");
  const [collectInfo, setCollectInfo] = useState(true);
  const [faqsEnabled, setFaqsEnabled] = useState(true);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = URL.createObjectURL(e.target.files[0]);
      setLogo(file);
    }
  };

  return (
    <>
      {/* 🔹 Basic Customization */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Widget Customization
          </Typography>
          <Stack spacing={4}>
            {/* Header Text */}
            <Stack spacing={1}>
              <Typography variant="subtitle2" color="textSecondary">
                Header Text
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={2}
                value={headerText}
                onChange={(e) => setHeaderText(e.target.value)}
              />
            </Stack>

            {/* Widget Icon */}
            <Stack spacing={1}>
              <Typography variant="subtitle2" color="textSecondary">
                Widget Icon
              </Typography>
              <ToggleButtonGroup
                value={widgetIcon}
                exclusive
                onChange={(_, val) => val && setWidgetIcon(val)}
                sx={{ flexWrap: "wrap", gap: 1 }}
              >
                {["chat-smile", "chat-base", "chat-bubble", "chat-db"].map(
                  (icon) => (
                    <ToggleButton
                      key={icon}
                      value={icon}
                      sx={{ width: 60, height: 60 }}
                    >
                      <Avatar sx={{ bgcolor: theme.palette.grey[200] }}>
                        {icon.slice(-1)}
                      </Avatar>
                    </ToggleButton>
                  )
                )}
              </ToggleButtonGroup>
              <Button
                component="label"
                variant="outlined"
                startIcon={<Upload />}
              >
                Upload Custom Icon
                <input
                  hidden
                  accept="image/*"
                  type="file"
                  onChange={handleLogoUpload}
                />
              </Button>
            </Stack>

            {/* Company Logo */}
            <Stack spacing={1}>
              <Typography variant="subtitle2" color="textSecondary">
                Company Logo
              </Typography>
              {logo ? (
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar src={logo} sx={{ width: 48, height: 48 }} />
                  <IconButton onClick={() => setLogo(null)} color="error">
                    <Delete />
                  </IconButton>
                </Stack>
              ) : (
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<Upload />}
                >
                  Upload Logo
                  <input
                    hidden
                    accept="image/*"
                    type="file"
                    onChange={handleLogoUpload}
                  />
                </Button>
              )}
            </Stack>

            {/* Widget Colors */}
            <Stack spacing={1}>
              <Typography variant="subtitle2" color="textSecondary">
                Widget Color
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                {["#1976d2", "#f44336", "#4caf50", "#ff9800"].map((c) => (
                  <Avatar
                    key={c}
                    sx={{
                      bgcolor: c,
                      cursor: "pointer",
                      border:
                        c === color ? "2px solid black" : "2px solid transparent",
                    }}
                    onClick={() => setColor(c)}
                  />
                ))}
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  style={{
                    width: 40,
                    height: 40,
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                  }}
                />
              </Stack>
            </Stack>

            {/* Collect Visitor Info */}
            <FormControlLabel
              control={
                <Switch
                  checked={collectInfo}
                  onChange={(e) => setCollectInfo(e.target.checked)}
                />
              }
              label="Collect Visitor Info"
            />

            {/* FAQs */}
            <FormControlLabel
              control={
                <Switch
                  checked={faqsEnabled}
                  onChange={(e) => setFaqsEnabled(e.target.checked)}
                />
              }
              label="Enable FAQs"
            />

            {/* Save Button */}
            <Button variant="contained" size="large" sx={{ alignSelf: "flex-start" }}>
              Save Customizations
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* 🔹 Advanced Customization Sections */}
      <AdvancedCustomization />
    </>
  );
}
