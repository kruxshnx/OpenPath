import 'next-auth';
import 'next-auth/jwt';

// Augment the NextAuth session/JWT to carry our app JWT and user id.
declare module 'next-auth' {
  interface Session {
    apiToken?: string;
    userId?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    apiToken?: string;
    userId?: string;
  }
}
