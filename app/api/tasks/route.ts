import { NextRequest, NextResponse } from "next/server";
import { getTasks, createTask } from "@/app/lib/task";

// GET /api/tasks - Get all tasks for a user
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userEmail = searchParams.get('userEmail');

        if (!userEmail) {
            return NextResponse.json(
                { error: "userEmail parameter is required" },
                { status: 400 }
            );
        }

        const tasks = await getTasks(userEmail);
        
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
        const body = await request.json();
        
        // Validate required fields
        if (!body.title || !body.userEmail) {
            return NextResponse.json(
                { error: "Missing required fields: title and userEmail are required" },
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
            userId: body.userEmail
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
