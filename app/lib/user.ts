import { prisma } from "./prisma";

export type User = {
    id: string;
    email: string;
    name?: string;
    googleId?: string;
    createdAt?: Date;
};

export type CreateOrUpdateUserData = {
    googleId: string;
    email: string;
    name: string;
};

export async function createOrUpdateUser(data: CreateOrUpdateUserData): Promise<User> {
    try {
        let user = await prisma.user.findUnique({
            where: { email: data.email }
        });

        if (user) {
            if (!user.googleId) {
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        googleId: data.googleId,
                        name: data.name || user.name
                    }
                });
            }
        } else {
            user = await prisma.user.create({
                data: {
                    googleId: data.googleId,
                    email: data.email,
                    name: data.name
                }
            });
        }

        return {
            id: user.id,
            email: user.email,
            name: user.name ?? undefined,
            googleId: user.googleId ?? undefined,
            createdAt: user.createdAt
        };
    } catch (error) {
        console.error("Error creating or updating user:", error);
        throw new Error("Failed to create or update user");
    }
}