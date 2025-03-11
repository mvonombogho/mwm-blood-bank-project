import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        await dbConnect();
        
        // Find user by email
        const user = await User.findOne({ email: credentials.email }).select('+password');
        
        // Check if user exists and password matches
        if (user && await user.matchPassword(credentials.password)) {
          // Update last login time
          user.lastLogin = new Date();
          await user.save({ validateBeforeSave: false });
          
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            permissions: user.permissions
          };
        }
        
        // Authentication failed
        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Add user role and permissions to the token on first sign in
      if (user) {
        token.userId = user.id;
        token.role = user.role;
        token.permissions = user.permissions;
      }
      return token;
    },
    async session({ session, token }) {
      // Add user role and permissions to the session
      session.user.id = token.userId;
      session.user.role = token.role;
      session.user.permissions = token.permissions;
      return session;
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

export default NextAuth(authOptions);
