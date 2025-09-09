"use client";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import { signIn, signOut, useSession } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();

  return (
    <Container className="justify-between items-center flex flex-row h-full">
      <Stack spacing={2} alignItems="end" justifyContent={"center"}>
        {status === "loading" && <Typography>Loading...</Typography>}
        {status !== "loading" && !session && (
          <>
            <Typography variant="h5">You are not signed in</Typography>
            <Button
              variant="contained"
              onClick={() => signIn("google")}
            >
              Sign in with Google
            </Button>
          </>
        )}
        {session && (
          <>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar src={session.user?.image ?? undefined} alt={session.user?.name ?? undefined} />
              <div>
                <Typography variant="h6">{session.user?.name}</Typography>
                <Typography variant="body2">{session.user?.email}</Typography>
              </div>
            </Stack>
            <Button variant="outlined" onClick={() => signOut()}>Sign out</Button>
          </>
        )}
      </Stack>
    </Container>
  );
}
