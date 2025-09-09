import { NextRequest, NextResponse } from "next/server";
import { getTasks, createTask, CreateTaskData } from "@/app/lib/task";

// GET /api/tasks - Get all tasks for a user
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: "userId parameter is required" },
                { status: 400 }
            );
        }

        const tasks = await getTasks(userId);
        
        return NextResponse.json(
            { 
                success: true, 
                tasks 
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("API Error fetching tasks:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
    try {
        const body: CreateTaskData = await request.json();
        
        // Validate required fields
        if (!body.title || !body.userId) {
            return NextResponse.json(
                { error: "Missing required fields: title and userId are required" },
                { status: 400 }
            );
        }

        // Validate title is not empty
        if (body.title.trim().length === 0) {
            return NextResponse.json(
                { error: "Task title cannot be empty" },
                { status: 400 }
            );
        }

        const task = await createTask({
            title: body.title.trim(),
            userId: body.userId
        });
        
        return NextResponse.json(
            { 
                success: true, 
                task 
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("API Error creating task:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
