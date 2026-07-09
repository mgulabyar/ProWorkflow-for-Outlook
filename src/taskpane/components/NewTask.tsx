// declare const Office: any;
// import React, { useState, useEffect } from "react";
// import {
//   Box,
//   TextField,
//   FormControl,
//   Select,
//   MenuItem,
//   Checkbox,
//   FormControlLabel,
//   Button,
//   Typography,
//   CircularProgress,
//   Alert,
// } from "@mui/material";
// import { getProjects, getTaskGroups, getStaff } from "../services/proworkflow";

// export const NewTask: React.FC = () => {
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [projectsList, setProjectsList] = useState<any[]>([]);
//   const [taskGroupsList, setTaskGroupsList] = useState<any[]>([]);
//   const [staffList, setStaffList] = useState<any[]>([]);
  
//   const [selectedProject, setSelectedProject] = useState("");
//   const [selectedTaskGroup, setSelectedTaskGroup] = useState("");
//   const [selectedAssignee, setSelectedAssignee] = useState("");
//   const [dueDate, setDueDate] = useState("");
//   const [urgent, setUrgent] = useState(false);
//   const [attachments, setAttachments] = useState(false);

//   const [uiLoading, setUiLoading] = useState(true);
//   const [taskGroupsLoading, setTaskGroupsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const readEmailAndFetchBaseData = async () => {
//       try {
//         setUiLoading(true);

//         if (typeof Office !== "undefined" && Office.context?.mailbox?.item) {
//           const item = Office.context.mailbox.item;
          
//           if (item.subject && typeof item.subject.getAsync === "function") {
//             item.subject.getAsync((result: { status: any; value: any; }) => {
//               if (result.status === Office.AsyncResultStatus.Succeeded) {
//                 setTitle(result.value || "");
//               }
//             });
//           } else {
//             setTitle(item.subject || "");
//           }

//           if (item.body && typeof item.body.getAsync === "function") {
//             item.body.getAsync(Office.CoercionType.Text, (result: { status: any; value: any; }) => {
//               if (result.status === Office.AsyncResultStatus.Succeeded) {
//                 setDescription(result.value || "");
//               }
//             });
//           }
//         }

//         const projectsData = await getProjects();
//         const staffData = await getStaff();

//         setProjectsList(Array.isArray(projectsData) ? projectsData : []);
//         setStaffList(Array.isArray(staffData) ? staffData : []);
//       } catch (err: any) {
//         setError("Failed to fetch startup data from ProWorkflow.");
//         console.error(err);
//       } finally {
//         setUiLoading(false);
//       }
//     };

//     readEmailAndFetchBaseData();
//   }, []);

//   const handleProjectChange = async (projectId: string) => {
//     setSelectedProject(projectId);
//     setSelectedTaskGroup("");
//     setTaskGroupsList([]);

//     if (!projectId) return;

//     try {
//       setTaskGroupsLoading(true);
//       const taskGroupsData = await getTaskGroups(projectId);
//       setTaskGroupsList(Array.isArray(taskGroupsData) ? taskGroupsData : []);
//     } catch (err) {
//       console.error("Failed to load task groups for selected project", err);
//     } finally {
//       setTaskGroupsLoading(false);
//     }
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//   };

//   if (uiLoading) {
//     return (
//       <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
//         <CircularProgress size={28} />
//       </Box>
//     );
//   }

//   return (
//     <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
//       {error && (
//         <Alert severity="error" sx={{ borderRadius: "6px", fontSize: "12px", fontFamily: '"Arial", sans-serif' }}>
//           {error}
//         </Alert>
//       )}

//       <Box>
//         <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#1E293B", mb: 0.5 }}>Title</Typography>
//         <TextField
//           fullWidth
//           size="small"
//           value={title}
//           onChange={(e) => setTitle(e.target.value)}
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
//         <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#1E293B", mb: 0.5 }}>Description</Typography>
//         <TextField
//           fullWidth
//           multiline
//           rows={5}
//           value={description}
//           onChange={(e) => setDescription(e.target.value)}
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
//         <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#1E293B", mb: 0.5 }}>Project</Typography>
//         <FormControl size="small" fullWidth>
//           <Select
//             value={selectedProject}
//             onChange={(e) => handleProjectChange(e.target.value)}
//             displayEmpty
//             sx={{ height: 42, borderRadius: "6px", fontSize: "13px", fontFamily: '"Arial", sans-serif' }}
//           >
//             <MenuItem value="" disabled>Select Project</MenuItem>
//             {projectsList.map((p) => (
//               <MenuItem key={p.id} value={p.id} sx={{ fontSize: "13px" }}>
//                 {p.name}
//               </MenuItem>
//             ))}
//           </Select>
//         </FormControl>
//       </Box>

//       <Box>
//         <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#1E293B", mb: 0.5 }}>Task list</Typography>
//         <FormControl fullWidth size="small">
//           <Select
//             value={selectedTaskGroup}
//             onChange={(e) => setSelectedTaskGroup(e.target.value)}
//             disabled={!selectedProject || taskGroupsLoading}
//             displayEmpty
//             sx={{ height: 42, borderRadius: "6px", fontSize: "13px", fontFamily: '"Arial", sans-serif' }}
//           >
//             {taskGroupsLoading ? (
//               <MenuItem value="" disabled>Loading task lists...</MenuItem>
//             ) : (
//               <>
//                 <MenuItem value="" disabled>Select a task list...</MenuItem>
//                 {taskGroupsList.map((tg) => (
//                   <MenuItem key={tg.id} value={tg.id} sx={{ fontSize: "13px" }}>
//                     {tg.name}
//                   </MenuItem>
//                 ))}
//               </>
//             )}
//           </Select>
//         </FormControl>
//       </Box>

//       <Box>
//         <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#1E293B", mb: 0.5 }}>Assignee</Typography>
//         <FormControl fullWidth size="small">
//           <Select
//             value={selectedAssignee}
//             onChange={(e) => setSelectedAssignee(e.target.value)}
//             displayEmpty
//             sx={{ height: 42, borderRadius: "6px", fontSize: "13px", fontFamily: '"Arial", sans-serif' }}
//           >
//             <MenuItem value="" disabled>Select an assignee...</MenuItem>
//             {staffList.map((st) => (
//               <MenuItem key={st.id} value={st.id} sx={{ fontSize: "13px" }}>
//                 {st.firstname} {st.lastname}
//               </MenuItem>
//             ))}
//           </Select>
//         </FormControl>
//       </Box>

//       <Box>
//         <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#1E293B", mb: 0.5 }}>Due date</Typography>
//         <TextField
//           type="date"
//           fullWidth
//           size="small"
//           value={dueDate}
//           onChange={(e) => setDueDate(e.target.value)}
//           sx={{
//             "& .MuiOutlinedInput-root": {
//               borderRadius: "6px",
//               fontFamily: '"Arial", sans-serif',
//               fontSize: "13px",
//             },
//           }}
//         />
//       </Box>

//       <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mt: 0.5 }}>
//         <FormControlLabel
//           control={
//             <Checkbox
//               checked={urgent}
//               onChange={(e) => setUrgent(e.target.checked)}
//               sx={{ color: "#2563EB", "&.Mui-checked": { color: "#2563EB" }, p: 0.5 }}
//             />
//           }
//           label="Mark as Urgent"
//           sx={{
//             "& .MuiFormControlLabel-label": {
//               fontFamily: '"Arial", sans-serif',
//               fontSize: "13px",
//               color: "#334155",
//             },
//           }}
//         />

//         <FormControlLabel
//           control={
//             <Checkbox
//               checked={attachments}
//               onChange={(e) => setAttachments(e.target.checked)}
//               sx={{ color: "#2563EB", "&.Mui-checked": { color: "#2563EB" }, p: 0.5 }}
//             />
//           }
//           label="Add attachments"
//           sx={{
//             "& .MuiFormControlLabel-label": {
//               fontFamily: '"Arial", sans-serif',
//               fontSize: "13px",
//               color: "#334155",
//             },
//           }}
//         />
//       </Box>

//       <Button
//         type="submit"
//         variant="contained"
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
//           mt: 1.5,
//           "&:hover": {
//             bgcolor: "#2563EB",
//             boxShadow: "none",
//           },
//         }}
//       >
//         Create task
//       </Button>
//     </Box>
//   );
// };

declare const Office: any;

import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Button,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import { getProjects, getTaskGroups, getStaff, createTask } from "../services/proworkflow";

/* global Office */

export const NewTask: React.FC = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [taskGroupsList, setTaskGroupsList] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedTaskGroup, setSelectedTaskGroup] = useState("");
  const [selectedAssignee, setSelectedAssignee] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [attachments, setAttachments] = useState(false);

  const [uiLoading, setUiLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [taskGroupsLoading, setTaskGroupsLoading] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const extractArray = (data: any): any[] => {
    if (Array.isArray(data)) return data;
    if (data && typeof data === "object") {
      for (const key in data) {
        if (Array.isArray(data[key])) {
          return data[key];
        }
      }
    }
    return [];
  };

  useEffect(() => {
    const readEmailAndFetchBaseData = async () => {
      try {
        setUiLoading(true);

        if (typeof Office !== "undefined" && Office.context?.mailbox?.item) {
          const item = Office.context.mailbox.item;
          
          if (item.subject && typeof item.subject.getAsync === "function") {
            item.subject.getAsync((result: { status: any; value: any; }) => {
              if (result.status === Office.AsyncResultStatus.Succeeded) {
                setTitle(result.value || "");
              }
            });
          } else {
            setTitle(item.subject || "");
          }

          if (item.body && typeof item.body.getAsync === "function") {
            item.body.getAsync(Office.CoercionType.Text, (result: { status: any; value: any; }) => {
              if (result.status === Office.AsyncResultStatus.Succeeded) {
                setDescription(result.value || "");
              }
            });
          }
        }

        const projectsData = await getProjects();
        const staffData = await getStaff();

        setProjectsList(extractArray(projectsData));
        setStaffList(extractArray(staffData));
      } catch (err: any) {
        setError("Failed to fetch startup data from ProWorkflow.");
        console.error(err);
      } finally {
        setUiLoading(false);
      }
    };

    readEmailAndFetchBaseData();
  }, []);

  const handleProjectChange = async (projectId: string) => {
    setSelectedProject(projectId);
    setSelectedTaskGroup("");
    setTaskGroupsList([]);

    if (!projectId) return;

    try {
      setTaskGroupsLoading(true);
      const taskGroupsData = await getTaskGroups(projectId);
      setTaskGroupsList(extractArray(taskGroupsData));
    } catch (err) {
      console.error("Failed to load task groups for selected project", err);
    } finally {
      setTaskGroupsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!title || !selectedProject) {
      setError("Title and Project are required to create a task!");
      return;
    }

    setSubmitLoading(true);

    const taskPayload = {
      name: title,
      description: description,
      taskgroupid: selectedTaskGroup || undefined,
      assigned: selectedAssignee ? [selectedAssignee] : [],
      duedate: dueDate || undefined,
      priority: urgent ? "high" : "normal"
    };

    try {
      await createTask(selectedProject, taskPayload);
      setSuccessMessage("Task created in ProWorkflow successfully!");
      
      setTitle("");
      setDescription("");
      setSelectedProject("");
      setSelectedTaskGroup("");
      setSelectedAssignee("");
      setDueDate("");
      setUrgent(false);
      setAttachments(false);
    } catch (err: any) {
      setError("Failed to create task inside ProWorkflow.");
      console.error(err);
    } finally {
      setSubmitLoading(false);
    }
  };

  if (uiLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
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
        <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#1E293B", mb: 0.5 }}>Title</Typography>
        <TextField
          fullWidth
          size="small"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={submitLoading}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "6px",
              fontFamily: '"Arial", sans-serif',
              fontSize: "13px",
            },
          }}
        />
      </Box>

      <Box>
        <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#1E293B", mb: 0.5 }}>Description</Typography>
        <TextField
          fullWidth
          multiline
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={submitLoading}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "6px",
              fontFamily: '"Arial", sans-serif',
              fontSize: "13px",
            },
          }}
        />
      </Box>

      <Box>
        <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#1E293B", mb: 0.5 }}>Project</Typography>
        <FormControl size="small" fullWidth>
          <Select
            value={selectedProject}
            onChange={(e) => handleProjectChange(e.target.value)}
            disabled={submitLoading}
            displayEmpty
            sx={{ height: 42, borderRadius: "6px", fontSize: "13px", fontFamily: '"Arial", sans-serif' }}
          >
            <MenuItem value="" disabled>Select Project</MenuItem>
            {projectsList.map((p) => (
              <MenuItem key={p.id} value={p.id} sx={{ fontSize: "13px" }}>
                {p.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box>
        <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#1E293B", mb: 0.5 }}>Task list</Typography>
        <FormControl fullWidth size="small">
          <Select
            value={selectedTaskGroup}
            onChange={(e) => setSelectedTaskGroup(e.target.value)}
            disabled={!selectedProject || taskGroupsLoading || submitLoading}
            displayEmpty
            sx={{ height: 42, borderRadius: "6px", fontSize: "13px", fontFamily: '"Arial", sans-serif' }}
          >
            {taskGroupsLoading ? (
              <MenuItem value="" disabled>Loading task lists...</MenuItem>
            ) : (
              <>
                <MenuItem value="" disabled>Select a task list...</MenuItem>
                {taskGroupsList.map((tg) => (
                  <MenuItem key={tg.id} value={tg.id} sx={{ fontSize: "13px" }}>
                    {tg.name}
                  </MenuItem>
                ))}
              </>
            )}
            {/*aselect */}
          </Select>
        </FormControl>
      </Box>

      <Box>
        <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#1E293B", mb: 0.5 }}>Assignee</Typography>
        <FormControl fullWidth size="small">
          <Select
            value={selectedAssignee}
            onChange={(e) => setSelectedAssignee(e.target.value)}
            disabled={submitLoading}
            displayEmpty
            sx={{ height: 42, borderRadius: "6px", fontSize: "13px", fontFamily: '"Arial", sans-serif' }}
          >
            <MenuItem value="" disabled>Select an assignee...</MenuItem>
            {staffList.map((st) => (
              <MenuItem key={st.id} value={st.id} sx={{ fontSize: "13px" }}>
                {st.firstname} {st.lastname}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box>
        <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#1E293B", mb: 0.5 }}>Due date</Typography>
        <TextField
          type="date"
          fullWidth
          size="small"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          disabled={submitLoading}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "6px",
              fontFamily: '"Arial", sans-serif',
              fontSize: "13px",
            },
          }}
        />
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mt: 0.5 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={urgent}
              onChange={(e) => setUrgent(e.target.checked)}
              disabled={submitLoading}
              sx={{ color: "#2563EB", "&.Mui-checked": { color: "#2563EB" }, p: 0.5 }}
            />
          }
          label="Mark as Urgent"
          sx={{
            "& .MuiFormControlLabel-label": {
              fontFamily: '"Arial", sans-serif',
              fontSize: "13px",
              color: "#334155",
            },
          }}
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={attachments}
              onChange={(e) => setAttachments(e.target.checked)}
              disabled={submitLoading}
              sx={{ color: "#2563EB", "&.Mui-checked": { color: "#2563EB" }, p: 0.5 }}
            />
          }
          label="Add attachments"
          sx={{
            "& .MuiFormControlLabel-label": {
              fontFamily: '"Arial", sans-serif',
              fontSize: "13px",
              color: "#334155",
            },
          }}
        />
      </Box>

      <Button
        type="submit"
        variant="contained"
        disabled={submitLoading}
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
          mt: 1.5,
          "&:hover": {
            bgcolor: "#2563EB",
            boxShadow: "none",
          },
        }}
      >
        {submitLoading ? <CircularProgress size={20} color="inherit" /> : "Create task"}
      </Button>
    </Box>
  );
};