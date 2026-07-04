import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';

const API_URL = process.env.API_URL ?? 'http://localhost:4000';

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      // public_repo lets us read the user's contribution activity later.
      authorization: { params: { scope: 'read:user user:email public_repo' } },
    }),
  ],
  callbacks: {
    // On initial sign-in, exchange the GitHub token for our own app JWT and
    // cache it in the session token.
    async jwt({ token, account }) {
      if (account?.access_token) {
        try {
          const res = await fetch(`${API_URL}/api/auth/github`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ accessToken: account.access_token }),
          });
          if (res.ok) {
            const data = (await res.json()) as {
              token: string;
              user: { id: string };
            };
            token.apiToken = data.token;
            token.userId = data.user.id;
          }
        } catch {
          // API unreachable during sign-in; the session will simply lack apiToken.
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.apiToken) session.apiToken = token.apiToken;
      if (token.userId) session.userId = token.userId;
      return session;
    },
  },
});
