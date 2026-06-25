/**
 * Edge-safe auth config — NO imports from Prisma or Node.js modules.
 * Used by proxy.ts (Edge Runtime) for JWT verification.
 */
import type { NextAuthConfig } from 'next-auth'

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role?: string }).role
        token.nom = (user as { nom?: string }).nom
        token.prenom = (user as { prenom?: string }).prenom
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.nom = token.nom as string
        session.user.prenom = token.prenom as string
      }
      return session
    },
  },
  providers: [], // Providers are added in auth.ts (server-only)
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  secret: process.env.AUTH_SECRET,
}
