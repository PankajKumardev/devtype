import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import dbConnect from '@/lib/mongodb';
import { User, generateUsername } from '@/models/User';

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          await dbConnect();
          
          const existingUser = await User.findOne({ email: user.email });
          
          if (!existingUser) {
            // Generate unique username
            let username = generateUsername(user.name || 'user');
            
            // Make sure username is unique (retry if collision)
            let attempts = 0;
            while (attempts < 5) {
              const exists = await User.findOne({ username });
              if (!exists) break;
              username = generateUsername(user.name || 'user');
              attempts++;
            }
            
            await User.create({
              name: user.name,
              username,
              email: user.email,
              image: user.image,
              providerId: account.providerAccountId,
              stats: {
                testsCompleted: 0,
                bestWpm: 0,
                avgAccuracy: 0,
              },
            });
          }
        } catch (error) {
          console.error('Database error during sign in:', error);
        }
      }
      return true;
    },
    async session({ session }) {
      if (session.user) {
        try {
          const mongooseInstance = await dbConnect();
          const collection = mongooseInstance.connection.collection('users');
          
          const dbUser = await collection.findOne({ email: session.user.email });
          
          if (dbUser) {
            session.user.id = dbUser._id.toString();
            
            // Generate username for existing users who don't have one
            if (!dbUser.username) {
              const username = generateUsername(dbUser.name || 'user');
              await collection.updateOne(
                { _id: dbUser._id },
                { $set: { username } }
              );
              session.user.username = username;
            } else {
              session.user.username = dbUser.username;
            }
            
            session.user.stats = dbUser.stats;
          }
        } catch (error) {
          console.error('Database error during session:', error);
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/',
  },
});

