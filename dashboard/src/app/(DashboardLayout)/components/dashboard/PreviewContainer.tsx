"use client";
import React, { useState } from "react";
import {
  Card,
  Stack,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Avatar,
  IconButton,
  Box,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";

export default function PreviewContainer() {
  const [status, setStatus] = useState("online");

  return (
    <Box
      sx={{
        pt: 4,
        pb: 6,
        display: "flex",
        justifyContent: "center",
        bgcolor: "grey.100",
        width: "100%",
        height: "100%",
      }}
    >
      <Box sx={{ position: "relative" }}>
        {/* Status Switcher */}
        <Stack
          direction="row"
          spacing={2}
          justifyContent="flex-start"
          alignItems="center"
          sx={{ mb: 3 }}
        >
          <ToggleButtonGroup
            value={status}
            exclusive
            onChange={(_, val) => val && setStatus(val)}
            sx={{
              bgcolor: "rgba(230,230,240,0.5)",
              borderRadius: 2,
              p: 0.5,
              height: 36,
            }}
          >
            <ToggleButton
              value="online"
              sx={{
                px: 2,
                border: "none",
                "&.Mui-selected": {
                  bgcolor: "white",
                  color: "text.primary",
                },
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: "success.main",
                  mr: 1,
                  boxShadow: "0px 2px 4px rgba(68,224,84,0.4)",
                }}
              />
              <Typography variant="body2">Online</Typography>
            </ToggleButton>

            <ToggleButton
              value="offline"
              sx={{
                px: 2,
                border: "none",
                "&.Mui-selected": {
                  bgcolor: "white",
                  color: "text.primary",
                },
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: "grey.500",
                  mr: 1,
                }}
              />
              <Typography variant="body2">Offline</Typography>
            </ToggleButton>
          </ToggleButtonGroup>

          {/* Preview Eye Button */}
          <IconButton
            sx={{
              bgcolor: "rgba(230,230,240,0.5)",
              "&:hover": { bgcolor: "rgba(207,207,211,0.4)" },
            }}
          >
            <VisibilityIcon />
          </IconButton>
        </Stack>

        {/* Chat Window Preview */}
        <Card
          variant="outlined"
          sx={{
            width: 300,
            maxHeight: 500,
            borderStyle: "dashed",
            borderColor: "rgba(0,0,0,0.15)",
            borderRadius: 3,
            mx: "auto",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            textAlign: "center",
            py: 4,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Widget closed{" "}
            <Typography component="span" variant="caption" color="text.secondary">
              + Preview bubble enabled
            </Typography>
          </Typography>
        </Card>

        {/* Bubble Preview (floating at bottom) */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            mt: 2,
            width: 300,
            mx: "auto",
          }}
        >
          <Box
            sx={{
              width: 70,
              height: 70,
              borderRadius: "50%",
              bgcolor: "#2081E2",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: 1,
            }}
          >
            {/* Bubble Icon */}
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M13.2222 4H17.9333C20.6 4 23.2667 5.06669 25.1333 7.02224C27 8.88891 28.1556 11.5556 28.1556 14.2222C28.1556 19.5556 24.0667 24 18.7333 24.4444V28.3556C18.7333 28.7111 18.5556 28.9778 18.2889 29.1556C18.1111 29.1556 18.1111 29.1556 17.9333 29.1556C17.7556 29.1556 17.4889 28.9778 17.3111 28.8L13.2222 24.3556C10.5556 24.3556 7.88888 23.2889 6.02222 21.3333C4.15555 19.3778 3 16.8 3 14.1334C3 8.53335 7.62222 4 13.2222 4ZM21.8445 15.7333C22.8222 15.7333 23.4444 15.1111 23.4444 14.1334C23.4444 13.1556 22.8222 12.5334 21.8445 12.5334C20.8667 12.5334 20.2444 13.1556 20.2444 14.1334C20.3333 15.1111 20.9556 15.7333 21.8445 15.7333ZM15.6222 15.7333C16.6 15.7333 17.2222 15.1111 17.2222 14.1334C17.2222 13.1556 16.6 12.5334 15.6222 12.5334C14.6445 12.5334 14.0222 13.1556 14.0222 14.1334C14.0222 15.1111 14.6445 15.7333 15.6222 15.7333ZM9.31112 15.7333C10.2889 15.7333 10.9111 15.1111 10.9111 14.1334C10.9111 13.1556 10.2889 12.5334 9.31112 12.5334C8.33334 12.5334 7.71113 13.1556 7.71113 14.1334C7.71113 15.1111 8.33334 15.7333 9.31112 15.7333Z" />
            </svg>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
