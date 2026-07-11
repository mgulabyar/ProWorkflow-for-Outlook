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
//   Tooltip,
// } from "@mui/material";
// import {
//   getProjects,
//   getTaskGroups,
//   getStaff,
//   createTask,
//   uploadTaskAttachment,
// } from "../services/proworkflow";

// interface Project {
//   id: string;
//   name: string;
// }

// interface TaskGroup {
//   id: string;
//   name: string;
// }

// interface StaffMember {
//   id: string;
//   firstname: string;
//   lastname: string;
// }

// interface EmailAttachment {
//   id: string;
//   name: string;
// }

// const PRIORITY_OPTIONS = [
//   { value: 1, label: "Low" },
//   { value: 2, label: "Normal" },
//   { value: 3, label: "High" },
//   { value: 4, label: "Urgent" },
// ];

// const fieldSx = {
//   "& .MuiOutlinedInput-root": {
//     borderRadius: "6px",
//     fontFamily: '"Arial", sans-serif',
//     fontSize: "13px",
//   },
// };

// const labelSx = { fontSize: "12px", fontWeight: 700, color: "#1E293B", mb: 0.5 };

// const extractArray = (data: any): any[] => {
//   if (Array.isArray(data)) return data;
//   if (data && typeof data === "object") {
//     for (const key in data) {
//       if (Array.isArray(data[key])) return data[key];
//     }
//   }
//   console.warn("[ProWorkflow] Response received but no array found in it. Raw data:", data);
//   return [];
// };

// const getSubjectAsync = (item: any): Promise<string> =>
//   new Promise((resolve) => {
//     if (item?.subject && typeof item.subject.getAsync === "function") {
//       item.subject.getAsync((result: any) => {
//         resolve(result.status === Office.AsyncResultStatus.Succeeded ? result.value || "" : "");
//       });
//     } else {
//       resolve(item?.subject || "");
//     }
//   });

// const getBodyAsync = (item: any): Promise<string> =>
//   new Promise((resolve) => {
//     if (item?.body && typeof item.body.getAsync === "function") {
//       item.body.getAsync(Office.CoercionType.Text, (result: any) => {
//         resolve(result.status === Office.AsyncResultStatus.Succeeded ? result.value || "" : "");
//       });
//     } else {
//       resolve("");
//     }
//   });

// const getEmailAttachments = (item: any): EmailAttachment[] => {
//   if (!item || !Array.isArray(item.attachments)) return [];
//   return item.attachments.filter((a: any) => !a.isInline);
// };

// const getAttachmentContentAsync = (
//   item: any,
//   attachmentId: string
// ): Promise<{ contentType: string; content: string } | null> =>
//   new Promise((resolve) => {
//     if (!item || typeof item.getAttachmentContentAsync !== "function") {
//       resolve(null);
//       return;
//     }
//     item.getAttachmentContentAsync(attachmentId, (result: any) => {
//       if (result.status === Office.AsyncResultStatus.Succeeded) {
//         resolve({ contentType: result.value.format || "application/octet-stream", content: result.value.content });
//       } else {
//         resolve(null);
//       }
//     });
//   });

// export const NewTask: React.FC = () => {
//   const [mounted, setMounted] = useState(false);

//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [projectsList, setProjectsList] = useState<Project[]>([]);
//   const [taskGroupsList, setTaskGroupsList] = useState<TaskGroup[]>([]);
//   const [staffList, setStaffList] = useState<StaffMember[]>([]);

//   const [selectedProject, setSelectedProject] = useState("");
//   const [selectedTaskGroup, setSelectedTaskGroup] = useState("");
//   const [selectedAssignee, setSelectedAssignee] = useState("");
//   const [dueDate, setDueDate] = useState("");
//   const [priority, setPriority] = useState<number>(2);
//   const [includeAttachments, setIncludeAttachments] = useState(false);

//   const [uiLoading, setUiLoading] = useState(true);
//   const [submitLoading, setSubmitLoading] = useState(false);
//   const [attachmentsUploading, setAttachmentsUploading] = useState(false);
//   const [taskGroupsLoading, setTaskGroupsLoading] = useState(false);

//   const [error, setError] = useState<string | null>(null);
//   const [successMessage, setSuccessMessage] = useState<string | null>(null);

//   const officeAvailable = typeof Office !== "undefined" && !!Office.context?.mailbox?.item;
//   const emailAttachments = officeAvailable ? getEmailAttachments(Office.context.mailbox.item) : [];

//   useEffect(() => {
//     const id = requestAnimationFrame(() => setMounted(true));
//     return () => cancelAnimationFrame(id);
//   }, []);

//   useEffect(() => {
//     const init = async () => {
//       setUiLoading(true);
//       setError(null);
//       try {
//         if (officeAvailable) {
//           const item = Office.context.mailbox.item;
//           const [subject, body] = await Promise.all([getSubjectAsync(item), getBodyAsync(item)]);
//           setTitle(subject);
//           setDescription(body);
//         }

//         const [projectsData, staffData] = await Promise.all([getProjects(), getStaff()]);
        
//         const extractedProjects = extractArray(projectsData);
//         const extractedStaff = extractArray(staffData);

//         console.log("%c[ProWorkflow UI Builder] Extracted Projects Array:", "color: #10B981; font-weight: bold;", extractedProjects);
//         console.log("%c[ProWorkflow UI Builder] Extracted Staff Array:", "color: #10B981; font-weight: bold;", extractedStaff);

//         if (extractedProjects.length === 0) {
//           console.warn("%c[ProWorkflow Diagnostic] Projects list returned 0 items. Make sure your newly created project's status/workstage is set to 'In Progress' on the ProWorkflow site!", "color: #F59E0B; font-weight: bold;");
//         }

//         setProjectsList(extractedProjects);
//         setStaffList(extractedStaff);
//       } catch (err: any) {
//         setError(err?.message || "Failed to fetch startup data from ProWorkflow.");
//         console.error(err);
//       } finally {
//         setUiLoading(false);
//       }
//     };

//     init();
//   }, [officeAvailable]);

//   const handleProjectChange = async (projectId: string) => {
//     setSelectedProject(projectId);
//     setSelectedTaskGroup("");
//     setTaskGroupsList([]);

//     if (!projectId) return;

//     try {
//       setTaskGroupsLoading(true);
//       const taskGroupsData = await getTaskGroups(projectId);
//       const extractedGroups = extractArray(taskGroupsData);
      
//       console.log(`%c[ProWorkflow UI Builder] Extracted Task Groups for Project ${projectId}:`, "color: #10B981; font-weight: bold;", extractedGroups);
      
//       setTaskGroupsList(extractedGroups);
//     } catch (err: any) {
//       console.error("Failed to load task groups for selected project", err);
//       setError(err?.message || "Failed to load task lists for the selected project.");
//     } finally {
//       setTaskGroupsLoading(false);
//     }
//   };

//   const uploadAllAttachments = async (taskId: string) => {
//     const item = Office.context.mailbox.item;
//     let failedCount = 0;

//     for (const att of emailAttachments) {
//       const content = await getAttachmentContentAsync(item, att.id);
//       if (!content) {
//         failedCount += 1;
//         continue;
//       }
//       try {
//         await uploadTaskAttachment(taskId, {
//           name: att.name,
//           contentType: content.contentType,
//           contentBytes: content.content,
//         });
//       } catch (err) {
//         console.error(`Failed to upload attachment "${att.name}"`, err);
//         failedCount += 1;
//       }
//     }

//     return failedCount;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError(null);
//     setSuccessMessage(null);

//     if (!title || !selectedProject) {
//       setError("Title and Project are required to create a task!");
//       return;
//     }

//     setSubmitLoading(true);

//     const taskPayload = {
//       name: title,
//       description,
//       taskgroupid: selectedTaskGroup || undefined,
//       contactid: selectedAssignee || undefined,
//       duedate: dueDate || undefined,
//       priorityid: priority,
//     };

//     try {
//       const createdTask = await createTask<{ id: string }>(selectedProject, taskPayload);

//       let attachmentWarning = "";
//       if (includeAttachments && emailAttachments.length > 0 && createdTask?.id) {
//         setAttachmentsUploading(true);
//         const failedCount = await uploadAllAttachments(createdTask.id);
//         setAttachmentsUploading(false);
//         if (failedCount > 0) {
//           attachmentWarning = ` (${failedCount} of ${emailAttachments.length} attachment${
//             emailAttachments.length > 1 ? "s" : ""
//           } failed to upload)`;
//         }
//       }

//       setSuccessMessage(`Task created in ProWorkflow successfully!${attachmentWarning}`);

//       setTitle("");
//       setDescription("");
//       setSelectedProject("");
//       setSelectedTaskGroup("");
//       setSelectedAssignee("");
//       setDueDate("");
//       setPriority(2);
//       setIncludeAttachments(false);
//     } catch (err: any) {
//       setError(err?.message || "Failed to create task inside ProWorkflow.");
//       console.error(err);
//     } finally {
//       setSubmitLoading(false);
//     }
//   };

//   if (uiLoading) {
//     return (
//       <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
//         <CircularProgress size={28} />
//       </Box>
//     );
//   }

//   const busy = submitLoading || attachmentsUploading;

//   return (
//     <Box
//       component="form"
//       onSubmit={handleSubmit}
//       sx={{
//         display: "flex",
//         flexDirection: "column",
//         gap: 2,
//         pt: 1,
//         opacity: mounted ? 1 : 0,
//         transform: mounted ? "translateY(0)" : "translateY(8px)",
//         transition: "opacity 400ms ease-out, transform 400ms ease-out",
//       }}
//     >
//       {error && (
//         <Alert severity="error" sx={{ borderRadius: "6px", fontSize: "12px", fontFamily: '"Arial", sans-serif' }}>
//           {error}
//         </Alert>
//       )}

//       {successMessage && (
//         <Alert severity="success" sx={{ borderRadius: "6px", fontSize: "12px", fontFamily: '"Arial", sans-serif' }}>
//           {successMessage}
//         </Alert>
//       )}

//       <Box>
//         <Typography sx={labelSx}>Title</Typography>
//         <TextField
//           fullWidth
//           size="small"
//           value={title}
//           onChange={(e) => setTitle(e.target.value)}
//           disabled={busy}
//           sx={fieldSx}
//         />
//       </Box>

//       <Box>
//         <Typography sx={labelSx}>Description</Typography>
//         <TextField
//           fullWidth
//           multiline
//           rows={5}
//           value={description}
//           onChange={(e) => setDescription(e.target.value)}
//           disabled={busy}
//           sx={fieldSx}
//         />
//       </Box>

//       <Box>
//         <Typography sx={labelSx}>Project</Typography>
//         <FormControl size="small" fullWidth>
//           <Select
//             value={selectedProject}
//             onChange={(e) => handleProjectChange(e.target.value as string)}
//             disabled={busy}
//             displayEmpty
//             sx={{ height: 42, borderRadius: "6px", fontSize: "13px", fontFamily: '"Arial", sans-serif' }}
//           >
//             <MenuItem value="" disabled>
//               Select Project
//             </MenuItem>
//             {projectsList.map((p) => (
//               <MenuItem key={p.id} value={p.id} sx={{ fontSize: "13px" }}>
//                 {p.name}
//               </MenuItem>
//             ))}
//           </Select>
//         </FormControl>
//       </Box>

//       <Box>
//         <Typography sx={labelSx}>Task list</Typography>
//         <FormControl fullWidth size="small">
//           <Select
//             value={selectedTaskGroup}
//             onChange={(e) => setSelectedTaskGroup(e.target.value as string)}
//             disabled={!selectedProject || taskGroupsLoading || busy}
//             displayEmpty
//             sx={{ height: 42, borderRadius: "6px", fontSize: "13px", fontFamily: '"Arial", sans-serif' }}
//           >
//             {taskGroupsLoading ? (
//               <MenuItem value="" disabled>
//                 Loading task lists...
//               </MenuItem>
//             ) : (
//               [
//                 <MenuItem key="placeholder" value="" disabled>
//                   Select a task list...
//                 </MenuItem>,
//                 ...taskGroupsList.map((tg) => (
//                   <MenuItem key={tg.id} value={tg.id} sx={{ fontSize: "13px" }}>
//                     {tg.name}
//                   </MenuItem>
//                 )),
//               ]
//             )}
//           </Select>
//         </FormControl>
//       </Box>

//       <Box>
//         <Typography sx={labelSx}>Assignee</Typography>
//         <FormControl fullWidth size="small">
//           <Select
//             value={selectedAssignee}
//             onChange={(e) => setSelectedAssignee(e.target.value as string)}
//             disabled={busy}
//             displayEmpty
//             sx={{ height: 42, borderRadius: "6px", fontSize: "13px", fontFamily: '"Arial", sans-serif' }}
//           >
//             <MenuItem value="" disabled>
//               Select an assignee...
//             </MenuItem>
//             {staffList.map((st) => (
//               <MenuItem key={st.id} value={st.id} sx={{ fontSize: "13px" }}>
//                 {st.firstname} {st.lastname}
//               </MenuItem>
//             ))}
//           </Select>
//         </FormControl>
//       </Box>

//       <Box>
//         <Typography sx={labelSx}>Priority</Typography>
//         <FormControl fullWidth size="small">
//           <Select
//             value={priority}
//             onChange={(e) => setPriority(e.target.value as number)}
//             disabled={busy}
//             sx={{ height: 42, borderRadius: "6px", fontSize: "13px", fontFamily: '"Arial", sans-serif' }}
//           >
//             {PRIORITY_OPTIONS.map((opt) => (
//               <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: "13px" }}>
//                 {opt.label}
//               </MenuItem>
//             ))}
//           </Select>
//         </FormControl>
//       </Box>

//       <Box>
//         <Typography sx={labelSx}>Due date</Typography>
//         <TextField
//           type="date"
//           fullWidth
//           size="small"
//           value={dueDate}
//           onChange={(e) => setDueDate(e.target.value)}
//           disabled={busy}
//           sx={fieldSx}
//         />
//       </Box>

//       <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mt: 0.5 }}>
//         <Tooltip
//           title={
//             officeAvailable
//               ? emailAttachments.length === 0
//                 ? "This email has no attachments to include."
//                 : ""
//               : "Open this from an email in Outlook to include attachments."
//           }
//           placement="right"
//         >
//           <span>
//             <FormControlLabel
//               control={
//                 <Checkbox
//                   checked={includeAttachments}
//                   onChange={(e) => setIncludeAttachments(e.target.checked)}
//                   disabled={busy || !officeAvailable || emailAttachments.length === 0}
//                   sx={{ color: "#2563EB", "&.Mui-checked": { color: "#2563EB" }, p: 0.5 }}
//                 />
//               }
//               label={
//                 emailAttachments.length > 0
//                   ? `Include email attachments (${emailAttachments.length})`
//                   : "Include email attachments"
//               }
//               sx={{
//                 "& .MuiFormControlLabel-label": {
//                   fontFamily: '"Arial", sans-serif',
//                   fontSize: "13px",
//                   color: "#334155",
//                 },
//               }}
//             />
//           </span>
//         </Tooltip>
//       </Box>

//       <Button
//         type="submit"
//         variant="contained"
//         disabled={busy}
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
//           transition: "background-color 200ms ease-out, transform 150ms ease-out",
//           "&:hover": {
//             bgcolor: "#2563EB",
//             boxShadow: "none",
//           },
//           "&:active": {
//             transform: "scale(0.98)",
//           },
//         }}
//       >
//         {attachmentsUploading ? (
//           <>
//             <CircularProgress size={18} color="inherit" sx={{ mr: 1 }} />
//             Uploading attachments...
//           </>
//         ) : submitLoading ? (
//           <CircularProgress size={20} color="inherit" />
//         ) : (
//           "Create task"
//         )}
//       </Button>
//     </Box>
//   );
// };


declare const Office: any;

import React, { useEffect, useState } from "react";
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
  Tooltip,
} from "@mui/material";
import {
  getProjects,
  getAllProjectsDebug,
  getTaskGroups,
  getStaff,
  createTask,
  uploadTaskAttachment,
} from "../services/proworkflow";


interface Project {
  id: string;
  name: string;
}

interface TaskGroup {
  id: string;
  name: string;
}

interface StaffMember {
  id: string;
  firstname: string;
  lastname: string;
}

interface EmailAttachment {
  id: string;
  name: string;
}

const PRIORITY_OPTIONS = [
  { value: 1, label: "Low" },
  { value: 2, label: "Normal" },
  { value: 3, label: "High" },
  { value: 4, label: "Urgent" },
];

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "6px",
    fontFamily: '"Arial", sans-serif',
    fontSize: "13px",
  },
};

const labelSx = { fontSize: "12px", fontWeight: 700, color: "#1E293B", mb: 0.5 };

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


const getSubjectAsync = (item: any): Promise<string> =>
  new Promise((resolve) => {
    if (item?.subject && typeof item.subject.getAsync === "function") {
      item.subject.getAsync((result: any) => {
        resolve(result.status === Office.AsyncResultStatus.Succeeded ? result.value || "" : "");
      });
    } else {
      resolve(item?.subject || "");
    }
  });

const getBodyAsync = (item: any): Promise<string> =>
  new Promise((resolve) => {
    if (item?.body && typeof item.body.getAsync === "function") {
      item.body.getAsync(Office.CoercionType.Text, (result: any) => {
        resolve(result.status === Office.AsyncResultStatus.Succeeded ? result.value || "" : "");
      });
    } else {
      resolve("");
    }
  });

const getEmailAttachments = (item: any): EmailAttachment[] => {
  if (!item || !Array.isArray(item.attachments)) return [];
  return item.attachments.filter((a: any) => !a.isInline);
};

const getAttachmentContentAsync = (
  item: any,
  attachmentId: string
): Promise<{ contentType: string; content: string } | null> =>
  new Promise((resolve) => {
    if (!item || typeof item.getAttachmentContentAsync !== "function") {
      resolve(null);
      return;
    }
    item.getAttachmentContentAsync(attachmentId, (result: any) => {
      if (result.status === Office.AsyncResultStatus.Succeeded) {
        resolve({ contentType: result.value.format || "application/octet-stream", content: result.value.content });
      } else {
        resolve(null);
      }
    });
  });

export const NewTask: React.FC = () => {
  const [mounted, setMounted] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [taskGroupsList, setTaskGroupsList] = useState<TaskGroup[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);

  const [selectedProject, setSelectedProject] = useState("");
  const [selectedTaskGroup, setSelectedTaskGroup] = useState("");
  const [selectedAssignee, setSelectedAssignee] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<number>(2);
  const [includeAttachments, setIncludeAttachments] = useState(false);

  const [uiLoading, setUiLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [attachmentsUploading, setAttachmentsUploading] = useState(false);
  const [taskGroupsLoading, setTaskGroupsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const officeAvailable = typeof Office !== "undefined" && !!Office.context?.mailbox?.item;
  const emailAttachments = officeAvailable ? getEmailAttachments(Office.context.mailbox.item) : [];

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const init = async () => {
      setUiLoading(true);
      setError(null);
      try {
        if (officeAvailable) {
          const item = Office.context.mailbox.item;
          const [subject, body] = await Promise.all([getSubjectAsync(item), getBodyAsync(item)]);
          setTitle(subject);
          setDescription(body);
        }

        console.log("STEP 1: About to call getProjects() and getStaff()...");

        let projectsData: any;
        let staffData: any;

        try {
          projectsData = await getProjects();
          console.log("STEP 2: getProjects() succeeded. Raw response:", JSON.stringify(projectsData, null, 2));
        } catch (projectsErr) {
          console.error("STEP 2 FAILED: getProjects() threw an error:", projectsErr);
          throw projectsErr;
        }

        try {
          const allProjectsDebug = await getAllProjectsDebug();
          console.log(
            "DEBUG: ALL projects regardless of status:",
            JSON.stringify(allProjectsDebug, null, 2)
          );
        } catch (debugErr) {
          console.error("DEBUG: fetching all projects failed:", debugErr);
        }

        try {
          staffData = await getStaff();
          console.log("STEP 3: getStaff() succeeded. Raw response:", staffData);
        } catch (staffErr) {
          console.error("STEP 3 FAILED: getStaff() threw an error:", staffErr);
          throw staffErr;
        }

        const parsedProjects = extractArray(projectsData);
        const parsedStaff = extractArray(staffData);

        console.log("STEP 4: Parsed projects array (what will show in the dropdown):", parsedProjects);
        console.log("STEP 4: Parsed staff array:", parsedStaff);
        console.log(`STEP 4: Found ${parsedProjects.length} project(s) and ${parsedStaff.length} staff member(s).`);

        setProjectsList(parsedProjects);
        setStaffList(parsedStaff);
      } catch (err: any) {
        setError(err?.message || "Failed to fetch startup data from ProWorkflow.");
        console.error(err);
      } finally {
        setUiLoading(false);
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    } catch (err: any) {
      console.error("Failed to load task groups for selected project", err);
      setError(err?.message || "Failed to load task lists for the selected project.");
    } finally {
      setTaskGroupsLoading(false);
    }
  };

  const uploadAllAttachments = async (taskId: string) => {
    const item = Office.context.mailbox.item;
    let failedCount = 0;

    for (const att of emailAttachments) {
      const content = await getAttachmentContentAsync(item, att.id);
      if (!content) {
        failedCount += 1;
        continue;
      }
      try {
        await uploadTaskAttachment(taskId, {
          name: att.name,
          contentType: content.contentType,
          contentBytes: content.content,
        });
      } catch (err) {
        console.error(`Failed to upload attachment "${att.name}"`, err);
        failedCount += 1;
      }
    }

    return failedCount;
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
      description,
      taskgroupid: selectedTaskGroup || undefined,
      contactid: selectedAssignee || undefined,
      duedate: dueDate || undefined,
      priorityid: priority,
    };

    try {
      const createdTask = await createTask<{ id: string }>(selectedProject, taskPayload);

      let attachmentWarning = "";
      if (includeAttachments && emailAttachments.length > 0 && createdTask?.id) {
        setAttachmentsUploading(true);
        const failedCount = await uploadAllAttachments(createdTask.id);
        setAttachmentsUploading(false);
        if (failedCount > 0) {
          attachmentWarning = ` (${failedCount} of ${emailAttachments.length} attachment${
            emailAttachments.length > 1 ? "s" : ""
          } failed to upload)`;
        }
      }

      setSuccessMessage(`Task created in ProWorkflow successfully!${attachmentWarning}`);

      setTitle("");
      setDescription("");
      setSelectedProject("");
      setSelectedTaskGroup("");
      setSelectedAssignee("");
      setDueDate("");
      setPriority(2);
      setIncludeAttachments(false);
    } catch (err: any) {
      setError(err?.message || "Failed to create task inside ProWorkflow.");
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

  const busy = submitLoading || attachmentsUploading;

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        pt: 1,
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
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={busy}
          sx={fieldSx}
        />
      </Box>

      <Box>
        <Typography sx={labelSx}>Project</Typography>
        <FormControl size="small" fullWidth>
          <Select
            value={selectedProject}
            onChange={(e) => handleProjectChange(e.target.value as string)}
            disabled={busy}
            displayEmpty
            sx={{ height: 42, borderRadius: "6px", fontSize: "13px", fontFamily: '"Arial", sans-serif' }}
          >
            <MenuItem value="" disabled>
              Select Project
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
            value={selectedTaskGroup}
            onChange={(e) => setSelectedTaskGroup(e.target.value as string)}
            disabled={!selectedProject || taskGroupsLoading || busy}
            displayEmpty
            sx={{ height: 42, borderRadius: "6px", fontSize: "13px", fontFamily: '"Arial", sans-serif' }}
          >
            {taskGroupsLoading ? (
              <MenuItem value="" disabled>
                Loading task lists...
              </MenuItem>
            ) : (
              [
                <MenuItem key="placeholder" value="" disabled>
                  Select a task list...
                </MenuItem>,
                ...taskGroupsList.map((tg) => (
                  <MenuItem key={tg.id} value={tg.id} sx={{ fontSize: "13px" }}>
                    {tg.name}
                  </MenuItem>
                )),
              ]
            )}
          </Select>
        </FormControl>
      </Box>

      <Box>
        <Typography sx={labelSx}>Assignee</Typography>
        <FormControl fullWidth size="small">
          <Select
            value={selectedAssignee}
            onChange={(e) => setSelectedAssignee(e.target.value as string)}
            disabled={busy}
            displayEmpty
            sx={{ height: 42, borderRadius: "6px", fontSize: "13px", fontFamily: '"Arial", sans-serif' }}
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
            sx={{ height: 42, borderRadius: "6px", fontSize: "13px", fontFamily: '"Arial", sans-serif' }}
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
{/* new task */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mt: 0.5 }}>
        <Tooltip
          title={
            officeAvailable
              ? emailAttachments.length === 0
                ? "This email has no attachments to include."
                : ""
              : "Open this from an email in Outlook to include attachments."
          }
          placement="right"
        >
          <span>
            <FormControlLabel
              control={
                <Checkbox
                  checked={includeAttachments}
                  onChange={(e) => setIncludeAttachments(e.target.checked)}
                  disabled={busy || !officeAvailable || emailAttachments.length === 0}
                  sx={{ color: "#2563EB", "&.Mui-checked": { color: "#2563EB" }, p: 0.5 }}
                />
              }
              label={
                emailAttachments.length > 0
                  ? `Include email attachments (${emailAttachments.length})`
                  : "Include email attachments"
              }
              sx={{
                "& .MuiFormControlLabel-label": {
                  fontFamily: '"Arial", sans-serif',
                  fontSize: "13px",
                  color: "#334155",
                },
              }}
            />
          </span>
        </Tooltip>
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
          mt: 1.5,
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
        {attachmentsUploading ? (
          <>
            <CircularProgress size={18} color="inherit" sx={{ mr: 1 }} />
            Uploading attachments...
          </>
        ) : submitLoading ? (
          <CircularProgress size={20} color="inherit" />
        ) : (
          "Create task"
        )}
      </Button>
    </Box>
  );
};