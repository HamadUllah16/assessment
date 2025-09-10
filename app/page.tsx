"use client";
import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  TextField,
  Button,
  Box,
  Avatar,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  Stack,
} from "@mui/material";
import {
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  Logout as LogoutIcon,
  PlusOne,
} from "@mui/icons-material";
import { signIn, signOut, useSession } from "next-auth/react";
// Task type is used by hooks; keep import if referenced elsewhere
import { useCreateTask, useTasks, useToggleTask } from "@/app/lib/hooks/use-tasks";

export default function Home() {
  const { data: session, status } = useSession();
  const userEmail = session?.user?.email ?? undefined;
  const { data: tasks = [], isLoading } = useTasks(userEmail);
  const createTaskMutation = useCreateTask(userEmail);
  const toggleTaskMutation = useToggleTask(userEmail);
  const loading = isLoading || createTaskMutation.isPending || toggleTaskMutation.isPending;
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });
  const [showCompleted, setShowCompleted] = useState(true);

  // Data fetching now handled by React Query

  const createTask = async () => {
    if (!newTaskTitle.trim() || !userEmail) return;
    try {
      await createTaskMutation.mutateAsync(newTaskTitle.trim());
      setNewTaskTitle("");
      showSnackbar("Task created successfully!", "success");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to create task";
      showSnackbar(message, "error");
    }
  };

  const toggleTask = async (taskId: string, currentDone: boolean) => {
    try {
      await toggleTaskMutation.mutateAsync({ taskId, currentDone });
      showSnackbar(!currentDone ? "Task marked as done!" : "Task marked as pending", "success");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to update task";
      showSnackbar(message, "error");
    }
  };

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      createTask();
    }
  };

  const filteredTasks = showCompleted ? tasks : tasks.filter(task => !task.done);
  const completedCount = tasks.filter(task => task.done).length;
  const pendingCount = tasks.filter(task => !task.done).length;

  if (status === "loading") {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!session) {
    return (
      <Container
        maxWidth="sm"
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%"
        }}
      >
        <Stack justifyContent={"center"} alignItems={"center"}>
          <Typography variant="h4" gutterBottom>
            Welcome to Task Manager
          </Typography>
          <Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Sign in to manage your tasks
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => signIn("google")}
              startIcon={<Avatar sx={{ width: 20, height: 20 }}>G</Avatar>}
            >
              Sign in with Google
            </Button>
          </Box>
        </Stack>
      </Container>
    );
  }

  return (
    <Stack height={"100%"} justifyContent={"center"} alignItems={"center"}>
      <Stack maxWidth={"md"} width={"100%"}>
        <Paper sx={{ p: 2 }} variant="outlined">
          <Stack gap={2}>


            <Stack
              direction="row"
              alignItems="center"
              gap={2}
            >
              {/* header */}
              <Avatar
                src={session.user?.image ?? undefined}
                alt={session.user?.name ?? undefined}
                sx={{ width: 32, height: 32 }}
              />

              <Button variant="outlined" size="small" onClick={() => signOut()}>Sign Out</Button>
              <IconButton>
                <AddIcon />
              </IconButton>
            </Stack>

            <Divider />
            {/* tasks */}

            {loading && tasks.length === 0 ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                <CircularProgress />
              </Box>
            ) : filteredTasks.length === 0 ? (
              <Box sx={{ p: 4, textAlign: "center" }}>
                <Typography variant="body1" color="text.secondary">
                  {showCompleted ? "No tasks yet. Create your first task!" : "No pending tasks. Great job!"}
                </Typography>
              </Box>
            ) : (
              <List>
                {filteredTasks.map((task, index) => (
                  <React.Fragment key={task.id}>
                    <ListItem
                      sx={{
                        backgroundColor: task.done ? "#f8f9fa" : "white",
                        opacity: task.done ? 0.7 : 1,
                      }}
                    >
                      <IconButton
                        onClick={() => toggleTask(task.id, task.done)}
                        disabled={loading}
                        sx={{ mr: 2 }}
                      >
                        {task.done ? (
                          <CheckCircleIcon color="success" />
                        ) : (
                          <RadioButtonUncheckedIcon />
                        )}
                      </IconButton>
                      <ListItemText
                        primary={
                          <Typography
                            variant="body1"
                            sx={{
                              textDecoration: task.done ? "line-through" : "none",
                              color: task.done ? "text.secondary" : "text.primary",
                            }}
                          >
                            {task.title}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {new Date(task.createdAt).toLocaleDateString()}
                          </Typography>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Chip
                          label={task.done ? "Done" : "Pending"}
                          color={task.done ? "success" : "warning"}
                          size="small"
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            )}
          </Stack>
        </Paper>
      </Stack >
    </Stack>
  )
}
