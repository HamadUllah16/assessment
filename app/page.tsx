"use client";
import React, { useState, useMemo } from "react";
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
} from "@mui/material";
import {
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { signIn, signOut, useSession } from "next-auth/react";
import { Task } from "@/app/lib/task";
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
    } catch (e: any) {
      showSnackbar(e?.message || "Failed to create task", "error");
    }
  };

  const toggleTask = async (taskId: string, currentDone: boolean) => {
    try {
      await toggleTaskMutation.mutateAsync({ taskId, currentDone });
      showSnackbar(!currentDone ? "Task marked as done!" : "Task marked as pending", "success");
    } catch (e: any) {
      showSnackbar(e?.message || "Failed to update task", "error");
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
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h4" gutterBottom>
            Welcome to Task Manager
          </Typography>
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
        </Paper>
      </Container>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Task Manager
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Chip
              label={`${pendingCount} pending`}
              color="warning"
              size="small"
            />
            <Chip
              label={`${completedCount} completed`}
              color="success"
              size="small"
            />
            <Avatar
              src={session.user?.image ?? undefined}
              alt={session.user?.name ?? undefined}
              sx={{ width: 32, height: 32 }}
            />
            <IconButton color="inherit" onClick={() => signOut()}>
              <LogoutIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4, pb: 4 }}>
        {/* Add Task Section */}
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Add New Task
          </Typography>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Enter task title..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={createTask}
              disabled={!newTaskTitle.trim() || loading}
              sx={{ minWidth: 120 }}
            >
              {loading ? <CircularProgress size={20} /> : "Add Task"}
            </Button>
          </Box>
        </Paper>

        {/* Task List Section */}
        <Paper elevation={2} sx={{ mb: 3 }}>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="h6">
                Your Tasks ({filteredTasks.length})
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showCompleted}
                    onChange={(e) => setShowCompleted(e.target.checked)}
                  />
                }
                label="Show completed"
              />
            </Box>
          </Box>

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
                          Created: {new Date(task.createdAt).toLocaleDateString()}
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
                  {index < filteredTasks.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Paper>

        {/* Stats Card */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Task Statistics
            </Typography>
            <Box sx={{ display: "flex", gap: 3 }}>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h4" color="primary">
                  {tasks.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Tasks
                </Typography>
              </Box>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h4" color="warning.main">
                  {pendingCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending
                </Typography>
              </Box>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h4" color="success.main">
                  {completedCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Completed
                </Typography>
              </Box>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h4" color="info.main">
                  {tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Completion Rate
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
    </Container>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
