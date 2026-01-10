import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { getDb, User, isAdmin } from './mongodb';

export const authConfig: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account }) {
      // Track user sign-in in MongoDB
      if (user.email) {
        try {
          const db = await getDb();
          await db.collection<User>('users').updateOne(
            { email: user.email },
            {
              $set: {
                name: user.name || undefined,
                image: user.image || undefined,
                provider: account?.provider || 'unknown',
                lastLoginAt: new Date(),
              },
              $setOnInsert: {
                email: user.email,
                createdAt: new Date(),
                // Note: loginCount is NOT set here - $inc will create it with value 1 on first insert
              },
              $inc: { loginCount: 1 },
            },
            { upsert: true }
          );
        } catch (error) {
          // Log error but don't block sign-in
          console.error('Error tracking user sign-in:', error);
        }
      }
      return true;
    },
    async session({ session }) {
      // Add isAdmin flag to session for client-side access control
      if (session.user?.email) {
        try {
          session.user.isAdmin = await isAdmin(session.user.email);
        } catch (error) {
          console.error('Error checking admin status:', error);
          session.user.isAdmin = false;
        }
      }
      return session;
    },
  },
};
