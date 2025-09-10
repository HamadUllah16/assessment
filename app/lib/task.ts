import { prisma } from "./prisma";

export type Task = {
    id: string
    title: string
    done: boolean
    userId: string
    createdAt: Date
}

export type CreateTaskData = {
    title: string
    userId: string
}

export type UpdateTaskData = {
    done: boolean
}

// Get all tasks for a specific user
export async function getTasks(userId: string): Promise<Task[]> {
    try {
        const tasks = await prisma.task.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        return tasks.map(task => ({
            id: task.id,
            title: task.title,
            done: task.done,
            userId: task.userId,
            createdAt: task.createdAt
        }));
    } catch (error) {
        console.error("Error fetching tasks:", error);
        throw new Error("Failed to fetch tasks");
    }
}

// Create a new task
export async function createTask(data: CreateTaskData): Promise<Task> {
    try {
        const task = await prisma.task.create({
            data: {
                title: data.title,
                userId: data.userId,
                done: false
            }
        });

        return {
            id: task.id,
            title: task.title,
            done: task.done,
            userId: task.userId,
            createdAt: task.createdAt
        };
    } catch (error) {
        console.error("Error creating task:", error);
        throw new Error("Failed to create task");
    }
}

// Update a task (mark as done)
export async function updateTask(taskId: string, data: UpdateTaskData): Promise<Task> {
    try {
        const task = await prisma.task.update({
            where: { id: taskId },
            data: {
                done: data.done
            }
        });

        return {
            id: task.id,
            title: task.title,
            done: task.done,
            userId: task.userId,
            createdAt: task.createdAt
        };
    } catch (error) {
        console.error("Error updating task:", error);
        throw new Error("Failed to update task");
    }
}

