// import React, { useState } from "react";
// import { Box, FormControl, Select, MenuItem, Typography } from "@mui/material";

// export const EditTask: React.FC = () => {
//   const [project, setProject] = useState("");
//   const [taskList, setTaskList] = useState("");
//   const [task, setTask] = useState("");

//   return (
//     <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 2 }}>
//       <Box>
//         <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#1E293B", mb: 0.5 }}>Project</Typography>
//         <FormControl fullWidth size="small">
//           <Select
//             value={project}
//             onChange={(e) => setProject(e.target.value)}
//             displayEmpty
//             sx={{
//               borderRadius: "6px",
//               fontFamily: '"Arial", sans-serif',
//               fontSize: "13px",
//             }}
//           >
//             <MenuItem value="" disabled>Select a project...</MenuItem>
//             <MenuItem value="1">Discover ProWorkflow</MenuItem>
//           </Select>
//         </FormControl>
//       </Box>


import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Button,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  getProjects,
  getTaskGroups,
  getTasksForTaskGroup,
  getTaskDetails,
  getStaff,
  updateTask,
} from "../services/proworkflow";

interface Project {
  id: string;
  name: string;
}

interface TaskGroup {
  id: string;
  name: string;
}

interface TaskSummary {
  id: string;
  name: string;
}

interface StaffMember {
  id: string;
  firstname: string;
  lastname: string;
}

const PRIORITY_OPTIONS = [
  { value: 1, label: "Low" },
  { value: 2, label: "Normal" },
  { value: 3, label: "High" },
  { value: 4, label: "Urgent" },
];

const extractArray = (data: any): any[] => {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    for (const key in data) {
      if (Array.isArray(data[key])) return data[key];
    }
  }
  console.warn("[ProWorkflow] Response received but no array found in it. Raw data:", data);
  return [];
};

const labelSx = { fontSize: "12px", fontWeight: 700, color: "#1E293B", mb: 0.5 };
const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "6px",
    fontFamily: '"Arial", sans-serif',
    fontSize: "13px",
  },
};
const selectSx = { borderRadius: "6px", fontFamily: '"Arial", sans-serif', fontSize: "13px" };

export const EditTask: React.FC = () => {
  const [mounted, setMounted] = useState(false);

  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [taskGroupsList, setTaskGroupsList] = useState<TaskGroup[]>([]);
  const [tasksList, setTasksList] = useState<TaskSummary[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);

  const [project, setProject] = useState("");
  const [taskList, setTaskList] = useState("");
  const [task, setTask] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignee, setAssignee] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<number>(2);

  const [uiLoading, setUiLoading] = useState(true);
  const [taskGroupsLoading, setTaskGroupsLoading] = useState(false);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [taskDetailsLoading, setTaskDetailsLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const init = async () => {
      setUiLoading(true);
      setError(null);
      try {
        const [projectsData, staffData] = await Promise.all([getProjects(), getStaff()]);
        setProjectsList(extractArray(projectsData));
        setStaffList(extractArray(staffData));
      } catch (err: any) {
        setError(err?.message || "Failed to load projects.");
        console.error(err);
      } finally {
        setUiLoading(false);
      }
    };
    init();
  }, []);

  const clearTaskFields = () => {
    setTitle("");
    setDescription("");
    setAssignee("");
    setDueDate("");
    setPriority(2);
  };

  const handleProjectChange = async (projectId: string) => {
    setProject(projectId);
    setTaskList("");
    setTaskGroupsList([]);
    setTask("");
    setTasksList([]);
    clearTaskFields();
    setError(null);
    setSuccessMessage(null);

    if (!projectId) return;

    try {
      setTaskGroupsLoading(true);
      const data = await getTaskGroups(projectId);
      setTaskGroupsList(extractArray(data));
    } catch (err: any) {
      setError(err?.message || "Failed to load task lists.");
      console.error(err);
    } finally {
      setTaskGroupsLoading(false);
    }
  };

  const handleTaskListChange = async (taskGroupId: string) => {
    setTaskList(taskGroupId);
    setTask("");
    setTasksList([]);
    clearTaskFields();
    setError(null);
    setSuccessMessage(null);

    if (!taskGroupId || !project) return;

    try {
      setTasksLoading(true);
      const data = await getTasksForTaskGroup(project, taskGroupId);
      setTasksList(extractArray(data));
    } catch (err: any) {
      setError(err?.message || "Failed to load tasks.");
      console.error(err);
    } finally {
      setTasksLoading(false);
    }
  };

  const handleTaskChange = async (taskId: string) => {
    setTask(taskId);
    setSuccessMessage(null);
    setError(null);

    if (!taskId || !project) {
      clearTaskFields();
      return;
    }

    try {
      setTaskDetailsLoading(true);
      const details: any = await getTaskDetails(project, taskId);
      setTitle(details?.name || "");
      setDescription(details?.description || "");
      setAssignee(details?.contactid || "");
      setDueDate(details?.duedate ? String(details.duedate).slice(0, 10) : "");
      setPriority(typeof details?.priorityid === "number" ? details.priorityid : 2);
    } catch (err: any) {
      setError(err?.message || "Failed to load task details.");
      console.error(err);
    } finally {
      setTaskDetailsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!project || !task || !title) {
      setError("Project, task, and title are required.");
      return;
    }

    setSaving(true);
    try {
      await updateTask(project, task, {
        name: title,
        description,
        contactid: assignee || undefined,
        duedate: dueDate || undefined,
        priorityid: priority,
      });
      setSuccessMessage("Task updated successfully!");
    } catch (err: any) {
      setError(err?.message || "Failed to update task.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (uiLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  const busy = saving || taskDetailsLoading;

  return (
    <Box
      component="form"
      onSubmit={handleSave}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2.5,
        pt: 2,
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(8px)",
        transition: "opacity 400ms ease-out, transform 400ms ease-out",
      }}
    >
      {error && (
        <Alert severity="error" sx={{ borderRadius: "6px", fontSize: "12px", fontFamily: '"Arial", sans-serif' }}>
          {error}
        </Alert>
      )}
      {successMessage && (
        <Alert severity="success" sx={{ borderRadius: "6px", fontSize: "12px", fontFamily: '"Arial", sans-serif' }}>
          {successMessage}
        </Alert>
      )}

      <Box>
        <Typography sx={labelSx}>Project</Typography>
        <FormControl fullWidth size="small">
          <Select
            value={project}
            onChange={(e) => handleProjectChange(e.target.value as string)}
            displayEmpty
            disabled={busy}
            sx={selectSx}
          >
            <MenuItem value="" disabled>
              Select a project...
            </MenuItem>
            {projectsList.map((p) => (
              <MenuItem key={p.id} value={p.id} sx={{ fontSize: "13px" }}>
                {p.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box>
        <Typography sx={labelSx}>Task list</Typography>
        <FormControl fullWidth size="small">
          <Select
            value={taskList}
            onChange={(e) => handleTaskListChange(e.target.value as string)}
            displayEmpty
            disabled={!project || taskGroupsLoading || busy}
            sx={selectSx}
          >
            <MenuItem value="" disabled>
              {taskGroupsLoading ? "Loading task lists..." : "Select a task list..."}
            </MenuItem>
            {taskGroupsList.map((tg) => (
              <MenuItem key={tg.id} value={tg.id} sx={{ fontSize: "13px" }}>
                {tg.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box>
        <Typography sx={labelSx}>Task</Typography>
        <FormControl fullWidth size="small">
          <Select
            value={task}
            onChange={(e) => handleTaskChange(e.target.value as string)}
            displayEmpty
            disabled={!taskList || tasksLoading || busy}
            sx={selectSx}
          >
            <MenuItem value="" disabled>
              {tasksLoading ? "Loading tasks..." : "Select a task..."}
            </MenuItem>
            {tasksList.map((t) => (
              <MenuItem key={t.id} value={t.id} sx={{ fontSize: "13px" }}>
                {t.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {task &&
        (taskDetailsLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <CircularProgress size={22} />
          </Box>
        ) : (
          <>
            <Box>
              <Typography sx={labelSx}>Title</Typography>
              <TextField
                fullWidth
                size="small"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={busy}
                sx={fieldSx}
              />
            </Box>

            <Box>
              <Typography sx={labelSx}>Description</Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={busy}
                sx={fieldSx}
              />
            </Box>

            <Box>
              <Typography sx={labelSx}>Assignee</Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value as string)}
                  displayEmpty
                  disabled={busy}
                  sx={selectSx}
                >
                  <MenuItem value="" disabled>
                    Select an assignee...
                  </MenuItem>
                  {staffList.map((st) => (
                    <MenuItem key={st.id} value={st.id} sx={{ fontSize: "13px" }}>
                      {st.firstname} {st.lastname}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box>
              <Typography sx={labelSx}>Priority</Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as number)}
                  disabled={busy}
                  sx={selectSx}
                >
                  {PRIORITY_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: "13px" }}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box>
              <Typography sx={labelSx}>Due date</Typography>
              <TextField
                type="date"
                fullWidth
                size="small"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={busy}
                sx={fieldSx}
              />
            </Box>

            <Button
              type="submit"
              variant="contained"
              disabled={busy}
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
                "&:hover": { bgcolor: "#2563EB", boxShadow: "none" },
                "&:active": { transform: "scale(0.98)" },
              }}
            >
              {saving ? <CircularProgress size={20} color="inherit" /> : "Save changes"}
            </Button>
          </>
        ))}
    </Box>
  );
};