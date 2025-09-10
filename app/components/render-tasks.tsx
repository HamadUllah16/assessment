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
import TaskCard from './tasks/task-card';
import TaskCreateDialog from './tasks/task-create-dialog';

type RenderTasksProps = {
    userEmail: string;
}

function RenderTasks({ userEmail }: RenderTasksProps) {
    const [page, setPage] = useState(0);
    const pageSize = 4;
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });
    const [showCompleted] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [search, setSearch] = useState("");
    const createTaskMutation = useCreateTask(userEmail);
    const toggleTaskMutation = useToggleTask(userEmail);
    const { data, isLoading } = useTasksPaginated(userEmail, page, pageSize);
    const tasks = (data?.tasks ?? []) as { id: string; title: string; done: boolean; userId: string; createdAt: Date }[];
    const total = data?.total ?? tasks.length;
    const loading = isLoading || createTaskMutation.isPending || toggleTaskMutation.isPending;
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
            ) : filteredTasks.length === 0 && tasks.length === 0 ? (
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
                        <TaskCard
                            key={task.id}
                            task={task}
                            toggleTask={toggleTask}
                            loading={loading}
                        />
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

            <TaskCreateDialog
                createTask={createTask}
                isDialogOpen={isDialogOpen}
                setIsDialogOpen={setIsDialogOpen}
                loading={loading}
                newTaskTitle={newTaskTitle}
                setNewTaskTitle={setNewTaskTitle}
            />

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