// import React, { useState } from "react";
// import { Box, TextField, Button, Typography, Alert, CircularProgress } from "@mui/material";
// import { testConnection, saveConfig } from "../services/proworkflow";

// interface SetupProps {
//   onSetupSuccess: () => void;
// }

// export const Setup: React.FC<SetupProps> = ({ onSetupSuccess }) => {
//   const [apiKey, setApiKey] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError(null);

//     if (!apiKey || !email || !password) {
//       setError("Please fill out all configuration fields!");
//       return;
//     }
//     setLoading(true);

//     const isConnected = await testConnection({ apiKey, email, password });

//     if (isConnected) {
//       saveConfig({ apiKey, email, password });
//       onSetupSuccess();
//     } else {
//       setError("Connection failed. Please verify your API Key and credentials.");
//     }
//     setLoading(false);
//   };

//   return (
//     <Box component="form" onSubmit={handleSubmit} sx={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 2.5 }}>
//       <Box sx={{ mb: 1 }}>
//         <Typography variant="h6" sx={{ fontWeight: 700, color: "#1E293B", fontSize: "16px" }}>
//           ProWorkflow Connection
//         </Typography>
//         <Typography sx={{ fontSize: "12px", color: "#64748B", mt: 0.5 }}>
//           Enter your dynamic account credentials to securely link with Outlook.
//         </Typography>
//       </Box>

//       {error && (
//         <Alert severity="error" sx={{ borderRadius: "6px", fontFamily: '"Arial", sans-serif', fontSize: "12px" }}>
//           {error}
//         </Alert>
//       )}

//       <Box>
//         <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#1E293B", mb: 0.5 }}>API Key</Typography>
//         <TextField
//           fullWidth
//           size="small"
//           placeholder="xxxxx-xxxxx-xxxxx-xxxxx"
//           value={apiKey}
//           onChange={(e) => setApiKey(e.target.value)}
//           disabled={loading}
//           sx={{
//             "& .MuiOutlinedInput-root": {
//               borderRadius: "6px",
//               fontFamily: '"Arial", sans-serif',
//               fontSize: "13px",
//             },
//           }}
//         />
//       </Box>

//       <Box>
//         <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#1E293B", mb: 0.5 }}>Email Address</Typography>
//         <TextField
//           fullWidth
//           size="small"
//           type="email"
//           placeholder="your.email@company.com"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           disabled={loading}
//           sx={{
//             "& .MuiOutlinedInput-root": {
//               borderRadius: "6px",
//               fontFamily: '"Arial", sans-serif',
//               fontSize: "13px",
//             },
//           }}
//         />
//       </Box>

//       <Box>
//         <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#1E293B", mb: 0.5 }}>Password</Typography>
//         <TextField
//           fullWidth
//           size="small"
//           type="password"
//           placeholder="Your account password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           disabled={loading}
//           sx={{
//             "& .MuiOutlinedInput-root": {
//               borderRadius: "6px",
//               fontFamily: '"Arial", sans-serif',
//               fontSize: "13px",
//             },
//           }}
//         />
//       </Box>

//       <Button
//         type="submit"
//         variant="contained"
//         disabled={loading}
//         fullWidth
//         sx={{
//           bgcolor: "#3B82F6",
//           color: "#ffffff",
//           textTransform: "none",
//           fontWeight: 700,
//           fontSize: "14px",
//           py: 1.2,
//           borderRadius: "6px",
//           boxShadow: "none",
//           mt: 1,
//           "&:hover": {
//             bgcolor: "#2563EB",
//             boxShadow: "none",
//           },
//         }}
//       >
//         {loading ? <CircularProgress size={20} color="inherit" /> : "Save Credentials"}


import React, { useEffect, useState } from "react";
import { Box, TextField, Button, Typography, Alert, CircularProgress } from "@mui/material";
import { testConnection, saveConfig, getStoredConfig } from "../services/proworkflow";

interface SetupProps {
  onSetupSuccess: () => void;
}

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "6px",
    fontFamily: '"Arial", sans-serif',
    fontSize: "13px",
  },
};

const labelSx = { fontSize: "12px", fontWeight: 700, color: "#1E293B", mb: 0.5 };

export const Setup: React.FC<SetupProps> = ({ onSetupSuccess }) => {
  const [apiKey, setApiKey] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const existing = getStoredConfig();
    if (existing) {
      setApiKey(existing.apiKey);
      setEmail(existing.email);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!apiKey || !email || !password) {
      setError("Please fill out all configuration fields!");
      return;
    }

    setLoading(true);

    try {
      const isConnected = await testConnection({ apiKey, email }, password);

      if (isConnected) {
        saveConfig({ apiKey, email }, password);
        onSetupSuccess();
      } else {
        setError("Connection failed. Please verify your API Key and credentials.");
      }
    } catch (err: any) {
      setError(err?.message || "Something went wrong while connecting. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 2.5 }}
    >
      <Box sx={{ mb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#1E293B", fontSize: "16px" }}>
          ProWorkflow Connection
        </Typography>
        <Typography sx={{ fontSize: "12px", color: "#64748B", mt: 0.5 }}>
          Enter your account credentials to securely link with Outlook.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ borderRadius: "6px", fontFamily: '"Arial", sans-serif', fontSize: "12px" }}>
          {error}
        </Alert>
      )}

      <Box>
        <Typography sx={labelSx}>API Key</Typography>
        <TextField
          fullWidth
          size="small"
          placeholder="xxxxx-xxxxx-xxxxx-xxxxx"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          disabled={loading}
          sx={fieldSx}
        />
      </Box>

      <Box>
        <Typography sx={labelSx}>Email Address</Typography>
        <TextField
          fullWidth
          size="small"
          type="email"
          placeholder="your.email@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          sx={fieldSx}
        />
      </Box>

      <Box>
        <Typography sx={labelSx}>Password</Typography>
        <TextField
          fullWidth
          size="small"
          type="password"
          placeholder="Your account password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          sx={fieldSx}
        />
      </Box>

      <Button
        type="submit"
        variant="contained"
        disabled={loading}
        fullWidth
        sx={{
          bgcolor: "#3B82F6",
          color: "#ffffff",
          textTransform: "none",
          fontWeight: 700,
          fontSize: "14px",
          py: 1.2,
          borderRadius: "6px",
          boxShadow: "none",
          mt: 1,
          transition: "background-color 200ms ease-out, transform 150ms ease-out",
          "&:hover": {
            bgcolor: "#2563EB",
            boxShadow: "none",
          },
          "&:active": {
            transform: "scale(0.98)",
          },
        }}
      >
        {loading ? <CircularProgress size={20} color="inherit" /> : "Save Credentials"}
      </Button>
    </Box>
  );
};
