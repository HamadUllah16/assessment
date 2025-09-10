import { NextRequest, NextResponse } from "next/server";
import { updateTask, UpdateTaskData } from "@/app/lib/task";

// PATCH /api/tasks/[id] - Update a task (mark as done)
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const taskId = id;
        const body: UpdateTaskData = await request.json();
        
        // Validate required fields
        if (typeof body.done !== 'boolean') {
            return NextResponse.json(
                { error: "Missing required field: done (boolean) is required" },
                { status: 400 }
            );
        }

        // Validate task ID
        if (!taskId) {
            return NextResponse.json(
                { error: "Task ID is required" },
                { status: 400 }
            );
        }

        const task = await updateTask(taskId, { done: body.done });
        
        return NextResponse.json(
            { 
                success: true, 
                task 
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("API Error updating task:", error);
        
        // Handle specific Prisma errors
        if (error instanceof Error && error.message.includes("Record to update not found")) {
            return NextResponse.json(
                { error: "Task not found" },
                { status: 404 }
            );
        }
        
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
