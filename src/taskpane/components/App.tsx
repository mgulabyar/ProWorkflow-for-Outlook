import React, { useState, useEffect } from "react";
import { Box, Tabs, Tab, IconButton, Typography } from "@mui/material";
import {
  Close as CloseIcon,
  MoreHoriz as MoreIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { NewTask } from "./NewTask";
import { EditTask } from "./EditTask";
import { Setup } from "./Setup";
import { getStoredConfig, hasActiveSessionPassword, clearConfig } from "../services/proworkflow";

export default function App() {
  const [isConfigured, setIsConfigured] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const config = getStoredConfig();
    setIsConfigured(!!config && hasActiveSessionPassword());
  }, []);

  const handleLogoutSettings = () => {
    clearConfig();
    setIsConfigured(false);
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#ffffff", fontFamily: '"Arial", sans-serif' }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 20px",
          borderBottom: "1px solid #E2E8F0",
        }}
      >
        <Typography sx={{ fontSize: "18px", fontWeight: 700, color: "#475569" }}>ProWorkflow</Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {isConfigured && (
            <IconButton size="small" onClick={handleLogoutSettings}>
              <SettingsIcon sx={{ color: "#64748B", fontSize: "18px" }} />
            </IconButton>
          )}
          <IconButton size="small">
            <MoreIcon sx={{ color: "#64748B", fontSize: "20px" }} />
          </IconButton>
          <IconButton size="small">
            <CloseIcon sx={{ color: "#64748B", fontSize: "20px" }} />
          </IconButton>
        </Box>
      </Box>

      {!isConfigured ? (
        <Setup onSetupSuccess={() => setIsConfigured(true)} />
      ) : (
        <Box sx={{ padding: "16px 20px" }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
            <Tabs
              value={activeTab}
              onChange={(_, val) => setActiveTab(val)}
              textColor="primary"
              indicatorColor="primary"
              sx={{
                minHeight: "40px",
                "& .MuiTabs-indicator": {
                  backgroundColor: "#3B82F6",
                  height: "2.5px",
                },
                "& .MuiTab-root": {
                  minHeight: "40px",
                  fontSize: "14px",
                  fontWeight: 600,
                  textTransform: "none",
                  fontFamily: '"Arial", sans-serif',
                  color: "#64748B",
                  padding: "6px 16px",
                  "&.Mui-selected": {
                    color: "#1E293B",
                  },
                },
              }}
            >
              <Tab icon={<AddIcon sx={{ fontSize: "16px", mr: 0.5 }} />} iconPosition="start" label="New task" />
              <Tab icon={<EditIcon sx={{ fontSize: "16px", mr: 0.5 }} />} iconPosition="start" label="Edit Task" />
            </Tabs>
          </Box>

          {activeTab === 0 ? <NewTask /> : <EditTask />}
        </Box>
      )}
    </Box>
  );
}

