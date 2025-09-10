import { NextRequest, NextResponse } from "next/server";
import { createTask } from "@/app/lib/task";
import { prisma } from "@/app/lib/prisma";

// GET /api/tasks - Get all tasks for a user
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userEmail = searchParams.get('userEmail');
        const limitParam = searchParams.get('limit');
        const pageParam = searchParams.get('page');

        if (!userEmail) {
            return NextResponse.json(
                { error: "userEmail parameter is required" },
                { status: 400 }
            );
        }
        const user = await prisma.user.findUnique({ where: { email: userEmail } });
        if (!user) {
            return NextResponse.json(
                { success: true, tasks: [], total: 0 },
                { status: 200 }
            );
        }

        const take = Math.max(1, Math.min(Number(limitParam) || 10, 100));
        const page = Math.max(0, Number(pageParam) || 0);

        const where = { userId: user.id } as const;
        const total = await prisma.task.count({ where });
        const tasks = await prisma.task.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip: page * take,
            take,
        });
        
        return NextResponse.json(
            {
                success: true,
                tasks,
                total
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
        const user = await prisma.user.findUnique({ where: { email: body.userEmail } });
        if (!user) {
            return NextResponse.json(
                { error: "User not found for provided email" },
                { status: 404 }
            );
        }

        const task = await createTask({
            title: body.title.trim(),
            userId: user.id
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
