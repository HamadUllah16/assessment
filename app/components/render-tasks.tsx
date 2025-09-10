"use client";
import React, { useState } from 'react'
import { useCreateTask, useTasksPaginated, useToggleTask } from "@/app/lib/hooks/use-tasks";
import {
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Chip,
    Checkbox,
    Stack,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Snackbar,
    Alert,
    InputAdornment,
    Skeleton,
} from "@mui/material";
import { Add, Search } from '@mui/icons-material';

type RenderTasksProps = {
    userEmail: string;
}

function RenderTasks({ userEmail }: RenderTasksProps) {
    const [page, setPage] = useState(0);
    const pageSize = 10;
    const { data, isLoading } = useTasksPaginated(userEmail, page, pageSize);
    const tasks = (data?.tasks ?? []) as { id: string; title: string; done: boolean; userId: string; createdAt: Date }[];
    const total = data?.total ?? tasks.length;
    const createTaskMutation = useCreateTask(userEmail);
    const toggleTaskMutation = useToggleTask(userEmail);
    const loading = isLoading || createTaskMutation.isPending || toggleTaskMutation.isPending;
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });
    const [showCompleted] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [search, setSearch] = useState("");
    // Data fetching now handled by React Query

    const createTask = async () => {
        if (!newTaskTitle.trim() || !userEmail) return;
        try {
            await createTaskMutation.mutateAsync(newTaskTitle.trim());
            setNewTaskTitle("");
            setIsDialogOpen(false);
            showSnackbar("Task created successfully!", "success");
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : "Failed to create task";
            showSnackbar(message, "error");
        }
    };


    const showSnackbar = (message: string, severity: "success" | "error") => {
        setSnackbar({ open: true, message, severity });
    };

    const filteredTasks = tasks.filter((task) => task.title.toLowerCase().includes(search.toLowerCase()));

    const toggleTask = async (taskId: string, currentDone: boolean) => {
        try {
            await toggleTaskMutation.mutateAsync({ taskId, currentDone });
            showSnackbar(!currentDone ? "Task marked as done!" : "Task marked as pending", "success");
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : "Failed to update task";
            showSnackbar(message, "error");
        }
    };
    return (
        <Stack
            height={"100%"}
            gap={0}
            overflow={"auto"}
        >
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                bgcolor={"white"}
                p={2}
                pt={4}
                sx={{
                    position: "sticky",
                    top: 0,
                    zIndex: 10
                }}
            >
                <Stack direction="row" alignItems="center" gap={1}>
                    <Typography variant="h6">Tasks</Typography>
                    <Chip sx={{ height: 30 }} label={`${filteredTasks.length} / ${total || 0}`} color="primary" size="small" />
                </Stack>

                <TextField
                    type="text"
                    placeholder="Search tasks"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    size="small"
                    slotProps={{
                        input: {
                            startAdornment: <InputAdornment position="start">
                                <Search />
                            </InputAdornment>
                        }
                    }}
                />
                <IconButton aria-label="Add task" onClick={() => setIsDialogOpen(true)}>
                    <Add />
                </IconButton>
            </Stack>
            {loading && tasks.length === 0 ? (
                <Stack p={2} px={4} gap={2}>
                    <Skeleton
                        variant="rectangular"
                        width={"100%"}
                        height={100}
                        sx={{ borderRadius: 1 }}
                    />
                    <Skeleton
                        variant="rectangular"
                        width={"100%"}
                        height={100}
                        sx={{ borderRadius: 1 }}
                    />
                    <Skeleton
                        variant="rectangular"
                        width={"100%"}
                        height={100}
                        sx={{ borderRadius: 1 }}
                    />
                    <Skeleton
                        variant="rectangular"
                        width={"100%"}
                        height={100}
                        sx={{ borderRadius: 1 }}
                    />
                </Stack>
            ) : filteredTasks.length === 0 ? (
                <Stack
                    justifyContent={"center"}
                    alignItems={"center"}
                    p={4}
                    height={"100%"}
                    border={"1px dashed #e0e0e0"}
                    borderRadius={1}
                    gap={2}
                >
                    <Typography variant="body1" color="text.secondary">
                        {showCompleted ? "No tasks yet. Create your first task!" : "No pending tasks. Great job!"}
                    </Typography>
                    <Button variant="contained" onClick={() => setIsDialogOpen(true)}>
                        Add Task
                    </Button>
                </Stack>
            ) : (
                <List
                    sx={{
                        padding: 2,
                        px: 4,
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                                overflow: "auto",
                                flexGrow: 1
                    }}
                >
                    {filteredTasks.map((task) => (
                        <React.Fragment key={task.id}>
                            <ListItem
                                sx={{
                                    backgroundColor: task.done ? "#f8f9fa" : "white",
                                    opacity: task.done ? 0.7 : 1,
                                    borderRadius: 1,
                                    border: "1px solid #e0e0e0",
                                }}
                            >
                                <Checkbox
                                    checked={task.done}
                                    onChange={() => toggleTask(task.id, task.done)}
                                    disabled={loading}
                                    sx={{ mr: 2 }}
                                />

                                <ListItemText
                                    primary={
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                textDecoration: task.done ? "line-through" : "none",
                                                color: task.done ? "text.secondary" : "text.primary",
                                                fontWeight: 500
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
            <Stack
                direction="row"
                justifyContent="space-between" alignItems="center"
                px={4}
                pb={2}
                position={"sticky"}
                bottom={0}
                zIndex={10}
                bgcolor={"white"}
            >
                <Button
                    variant="outlined"
                    size="small"
                    disabled={page <= 0}
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                >
                    Previous
                </Button>
                <Typography variant="caption">
                    Page {page + 1} of {Math.max(1, Math.ceil((total || 0) / pageSize))}
                </Typography>
                <Button
                    variant="outlined"
                    size="small"
                    disabled={(page + 1) * pageSize >= (total || 0)}
                    onClick={() => setPage(p => p + 1)}
                >
                    Next
                </Button>
            </Stack>
            <Dialog open={isDialogOpen} onClose={() => !loading && setIsDialogOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Create Task</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Task title"
                        type="text"
                        fullWidth
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && newTaskTitle.trim() && !loading) {
                                e.preventDefault();
                                createTask();
                            }
                        }}
                        disabled={loading}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsDialogOpen(false)} disabled={loading}>Cancel</Button>
                    <Button onClick={createTask} variant="contained" disabled={!newTaskTitle.trim() || loading}>
                        {loading ? 'Creating…' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={2500}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Stack>
    )
}

export default RenderTasks