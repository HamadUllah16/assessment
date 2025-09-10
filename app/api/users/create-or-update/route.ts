import { NextRequest, NextResponse } from "next/server";
import { createOrUpdateUser, CreateOrUpdateUserData } from "@/app/lib/user";

export async function POST(request: NextRequest) {
    try {
        const body: CreateOrUpdateUserData = await request.json();
        
        // Validate required fields
        if (!body.googleId || !body.email || !body.name) {
            return NextResponse.json(
                { error: "Missing required fields: googleId, email, and name are required" },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(body.email)) {
            return NextResponse.json(
                { error: "Invalid email format" },
                { status: 400 }
            );
        }

        const user = await createOrUpdateUser(body);
        
        return NextResponse.json(
            { 
                success: true, 
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    googleId: user.googleId,
                    createdAt: user.createdAt
                }
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("API Error creating or updating user:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
