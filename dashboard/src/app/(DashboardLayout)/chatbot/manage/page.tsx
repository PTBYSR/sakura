"use client";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Stack,
  Grid,
  Avatar,
  IconButton,
  Button,
  Switch,
  FormControlLabel,
  ToggleButton,
  ToggleButtonGroup,
  Box,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Upload, Delete } from "@mui/icons-material";
import WidgetCustomization from "../../components/dashboard/WidgetCustomization";
import PreviewContainer from "../../components/dashboard/PreviewContainer";

const Manage = () => {
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
     <Box sx={{ flexGrow: 1, p: 2 }}>
      <Grid container spacing={4}>

        {/* Customization - scrollable */}
        <Grid size={{
              xs: 12,
              lg: 8,
              md: 7,
            }}>
          <WidgetCustomization />
        </Grid>
        {/* Preview - sticky */}
        <Grid 
         size={{
              xs: 12,
              lg: 8,
              md: 7,
            }}
        >
          <Box sx={{ position: "sticky", top: 16 }}>
            <PreviewContainer />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Manage;
