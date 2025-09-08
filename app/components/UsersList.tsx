"use client";
import { useEffect, useState } from "react";
import { URL_CONSTANTS } from "../lib/url-constants";
import { List, ListItem, ListItemText, Typography } from "@mui/material";
import Box from "@mui/material/Box";

export type User = {
    id: string;
    name: string;
    email: string;
};

export default function UsersList() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getUsers = async () => {
            try {
                const res = await fetch(URL_CONSTANTS.getUsers);
                const data = await res.json();
                setUsers(data.users ?? []);
            } catch (err) {
                console.error("Failed to fetch users", err);
            } finally {
                setLoading(false);
            }
        };
        getUsers();
    }, []);

    if (loading) return <p>Loading users...</p>;

    return (
       <Box>
        <Typography variant="h5">Users List</Typography>
        <List>
            {users.map((user: User) => (
                <ListItem key={user.id}>
                    <ListItemText primary={user.name} secondary={user.email} />
                </ListItem>
            ))}
        </List>
       </Box>
    );
}
