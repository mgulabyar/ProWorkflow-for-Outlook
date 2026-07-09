import React, { useState } from "react";
import { Box, FormControl, Select, MenuItem, Typography } from "@mui/material";

export const EditTask: React.FC = () => {
  const [project, setProject] = useState("");
  const [taskList, setTaskList] = useState("");
  const [task, setTask] = useState("");
//  wokring  
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 2 }}>
      <Box>
        <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#1E293B", mb: 0.5 }}>Project</Typography>
        <FormControl fullWidth size="small">
          <Select
            value={project}
            onChange={(e) => setProject(e.target.value)}
            displayEmpty
            sx={{
              borderRadius: "6px",
              fontFamily: '"Arial", sans-serif',
              fontSize: "13px",
            }}
          >
            <MenuItem value="" disabled>Select a project...</MenuItem>
            <MenuItem value="1">Discover ProWorkflow</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box>
        <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#1E293B", mb: 0.5 }}>Task list</Typography>
        <FormControl fullWidth size="small">
          <Select
            value={taskList}
            onChange={(e) => setTaskList(e.target.value)}
            displayEmpty
            disabled={!project}
            sx={{
              borderRadius: "6px",
              fontFamily: '"Arial", sans-serif',
              fontSize: "13px",
            }}
          >
            <MenuItem value="" disabled>Select a task list...</MenuItem>
            <MenuItem value="1">Get Started</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box>
        <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#1E293B", mb: 0.5 }}>Task</Typography>
        <FormControl fullWidth size="small">
          <Select
            value={task}
            onChange={(e) => setTask(e.target.value)}
            displayEmpty
            disabled={!taskList}
            sx={{
              borderRadius: "6px",
              fontFamily: '"Arial", sans-serif',
              fontSize: "13px",
            }}
          >
            <MenuItem value="" disabled>Select a task...</MenuItem>
            <MenuItem value="1">Configure Outlook Connection</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
};