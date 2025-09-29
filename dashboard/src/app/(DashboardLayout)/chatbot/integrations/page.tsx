"use client";
import React, { useState } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  IconButton,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import Image from "next/image";

interface IntegrationCardProps {
  name: string;
  desc: string;
  icon: string; // image URL
  disabled?: boolean;
}

const integrations = [
  {
    name: "WhatsApp",
    desc: "Connect your WhatsApp and chat with visitors directly",
    icon: "/images/integration-logo/whatsapp.png",
    disabled: false,
  },
  {
    name: "Facebook Messenger",
    desc: "Streamline your conversations, all in one place",
    icon: "/images/integration-logo/facebook.png",
    disabled: false,
  },
  {
    name: "Instagram",
    desc: "Streamline your conversations, all in one place",
    icon: "/images/integration-logo/instagram.png",
    disabled: true,
  },
  {
    name: "Email",
    desc: "Manage all customer emails within Chatway inbox",
    icon: "/images/integration-logo/email.png",
    disabled: true,
  },
  {
    name: "Shopify",
    desc: "Get Chatway up and running on your Shopify store",
    icon: "/images/integration-logo/whatsapp.png",
    disabled: true,
  },

];



const IntegrationCard: React.FC<IntegrationCardProps> = ({
  name,
  desc,
  icon,
  disabled,
}) => {
  return (
    <Card
      sx={{
    p: 2,
    display: "flex",
    alignItems: "left",
    flexDirection: "column",
    gap: 2,
    boxShadow: "none",
    border: "1px solid",
    borderColor: "grey.200",
    minWidth: 400,   // ensures card never shrinks too small
    maxWidth: 500,   // prevents card from stretching too wide
    width: "100%",   // makes it responsive within grid
  }}
    >
      {/* App Icon */}
                 <Image src={icon} alt={name} width={30} height={30} />


      {/* Text Section */}
      <CardContent sx={{ flexGrow: 1, p: 0 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="subtitle1" fontWeight={600}>
            {name}
          </Typography>
          <IconButton size="small" color="primary">
            <InfoOutlinedIcon fontSize="small" />
          </IconButton>
        </Stack>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ whiteSpace: "normal" }}
        >
          {desc}
        </Typography>
      </CardContent>

      {/* Action Button */}
      <Button
        variant={disabled ? "outlined" : "contained"}
        color={disabled ? "inherit" : "primary"}
        disabled={disabled}
        endIcon={
          !disabled && (
            <ArrowForwardIosIcon sx={{ fontSize: 14, ml: -0.5 }} />
          )
        }
        sx={{
          textTransform: "none",
          fontWeight: 500,
          minWidth: "110px",
        }}
      >
        {disabled ? "Coming Soon" : "Connect Now"}
      </Button>
    </Card>
  );
};


export default function IntegrationSettingsPage() {
  const [iosUrl, setIosUrl] = useState("");
  const [androidUrl, setAndroidUrl] = useState("");

  return (
    <Stack spacing={4} sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={600}>
        Integration Settings
      </Typography>

      <Grid container spacing={4}>
        {/* Mobile App Card */}
        

        {/* Integrations */}
        {integrations.map((app) => (
          <Grid
          size={{
                xs: 12,
                md: 6,
                sm: 6,
          }}
           key={app.name}>
            
<IntegrationCard
  name={app.name}
  desc={app.desc}
  icon={app.icon}
  disabled={true}
/>
</Grid>


            
        ))}

        {/* Contact Us Card */}
        <Grid size={{

                xs: 12,
                md: 6,
        }} >
          <Card>
            <CardContent>
              <Typography variant="h6">
                Couldn’t find what you’re looking for?
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Contact us for more integrations and support.
              </Typography>
              <Button variant="contained" color="primary">
                Contact Us
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}
