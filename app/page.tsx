"use client";
import React from "react";
import {
  Typography,
  Container,
  Paper,
  Button,
  Box,
  Avatar,
  CircularProgress,
  Divider,
  Stack,
  IconButton,
} from "@mui/material";
import { signIn, signOut, useSession } from "next-auth/react";
import RenderTasks from "./components/render-tasks";
import { Logout } from "@mui/icons-material";

export default function Home() {
  const { data: session, status } = useSession();
  const userEmail = session?.user?.email ?? undefined;

  if (status === "loading") {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!session) {
    return (
      <Container
        maxWidth="sm"
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%"
        }}
      >
        <Stack justifyContent={"center"} alignItems={"center"}>
          <Typography variant="h4" gutterBottom>
            Welcome to Task Manager
          </Typography>
          <Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Sign in to manage your tasks
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => signIn("google")}
              startIcon={<Avatar sx={{ width: 20, height: 20 }}>G</Avatar>}
            >
              Sign in with Google
            </Button>
          </Box>
        </Stack>
      </Container>
    );
  }

  return (
    <Stack
      height={"100%"}
      justifyContent={"center"}
      alignItems={"center"}
      p={2}
    >
      <Stack
        height={"100%"}
        maxWidth={"md"}
        width={"100%"}
      >
        <Paper variant="outlined" sx={{ overflow: "auto", height: "100%" }}>
          <Stack height={"100%"}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent={"space-between"}
              bgcolor={"#f0f0f0"}
              gap={2}
              padding={2}
            >
              <Stack
                direction="row"
                alignItems="center"
                gap={1}
              >
                <Avatar
                  src={session.user?.image ?? ""}
                  alt={session.user?.name ?? ""}
                  sx={{ width: 32, height: 32 }}
                />
                <Stack direction="column" gap={0} justifyContent={"center"}>
                  <Typography variant="body2" lineHeight={1}>{session.user?.name ?? ""}</Typography>
                  <Typography variant="caption" color="text.secondary">{session.user?.email ?? ""}</Typography>
                </Stack>
              </Stack>

              <IconButton onClick={() => signOut()}>
                <Logout />
              </IconButton>
            </Stack>

            <Divider />
            {/* tasks */}
            {userEmail && (
              <RenderTasks userEmail={userEmail} />
            )}

          </Stack>
        </Paper>
      </Stack >
    </Stack>
  )
}
