import { URL_CONSTANTS } from "@/app/lib/url-constants";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

const handler = NextAuth({
  providers: [
    GoogleProvider({
        clientId: process.env.AUTH_GOOGLE_ID as string,
        clientSecret: process.env.AUTH_GOOGLE_SECRET as string,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  callbacks: {
      async signIn({ user, account }) {
          if (account?.provider === "google" && user?.email && user?.name) {
              try {
                const response = await fetch(`${process.env.NEXTAUTH_URL}${URL_CONSTANTS.createOrUpdateUser}`, {
                  method: "POST",
                      body: JSON.stringify({
                          googleId: user.id,
                          email: user.email,
                          name: user.name,
                      }),
                  });

                  if (!response.ok) {
                      console.error("Failed to sync user with backend:", await response.text());
                      return true;
                  }

                  const result = await response.json();
                  console.log("User synced with backend:", result);
              } catch (error) {
                  console.error("Error syncing user with backend:", error);
              }
          }
          return true;
      },
    async session({ session, token }) {
      if (token?.sub && session?.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };


