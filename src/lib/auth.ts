import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { authConfig } from '@/lib/auth.config'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email, password } = parsed.data

        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user || !user.password) return null

        const passwordMatch = await bcrypt.compare(password, user.password)
        if (!passwordMatch) return null

        return {
          id: user.id,
          email: user.email,
          name: `${user.prenom} ${user.nom}`,
          image: user.image,
          role: user.role,
          nom: user.nom,
          prenom: user.prenom,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        })

        if (!existingUser) {
          const nameParts = (user.name || '').split(' ')
          const prenom = nameParts[0] || ''
          const nom = nameParts.slice(1).join(' ') || prenom

          await prisma.user.create({
            data: {
              email: user.email!,
              nom,
              prenom,
              image: user.image,
              emailVerified: true,
              password: null,
            },
          })
        }
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role?: string }).role
        token.nom = (user as { nom?: string }).nom
        token.prenom = (user as { prenom?: string }).prenom
      }

      if (token.email && !token.role) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: { id: true, role: true, nom: true, prenom: true },
        })
        if (dbUser) {
          token.id = dbUser.id
          token.role = dbUser.role
          token.nom = dbUser.nom
          token.prenom = dbUser.prenom
        }
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
})
