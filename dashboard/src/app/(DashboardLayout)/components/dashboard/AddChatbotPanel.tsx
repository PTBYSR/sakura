import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

const AddChatbotPanel = () => {
  const theme = useTheme();

  return (
    <DashboardCard title="Chatbot">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        sx={{
          minHeight: "300px",
          textAlign: "center",
          p: 3,
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <AddCircleOutlineIcon
          sx={{
            fontSize: 64,
            color: theme.palette.primary.main,
            mb: 2,
          }}
        />
        <Typography variant="h6" gutterBottom>
          No Chatbot Found
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ maxWidth: "400px", mb: 3 }}
        >
          You don’t have any chatbot set up yet. Create your first chatbot to
          start engaging with users and managing conversations.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<AddCircleOutlineIcon />}
        >
          Add Chatbot
        </Button>
      </Box>
    </DashboardCard>
  );
};

export default AddChatbotPanel;
