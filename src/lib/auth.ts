import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          return null
        }

        // For demo purposes, we'll find or create a user
        // In production, you'd verify password here
        let user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            company: true,
          }
        })

        if (!user) {
          // For demo, create a user if they don't exist
          const defaultCompany = await prisma.company.findFirst()
          if (!defaultCompany) {
            return null
          }

          user = await prisma.user.create({
            data: {
              email: credentials.email,
              name: credentials.email.split('@')[0],
              companyId: defaultCompany.id,
              canApprove: true,
              mpcKeyShare: 'demo_key_share_' + Math.random().toString(36),
            },
            include: {
              company: true,
            }
          })
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: null,
          companyId: user.companyId,
          canApprove: user.canApprove,
          companyTier: user.company.tier,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.companyId = (user as any).companyId
        token.canApprove = (user as any).canApprove
        token.companyTier = (user as any).companyTier
      }
      return token
    },
    session: async ({ session, token }) => {
      if (session.user) {
        (session.user as any).id = token.sub
        ;(session.user as any).companyId = token.companyId
        ;(session.user as any).canApprove = token.canApprove
        ;(session.user as any).companyTier = token.companyTier
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
}

declare module 'next-auth' {
  interface User {
    companyId: string
    canApprove: boolean
    companyTier: string
  }
  
  interface Session {
    user: {
      id: string
      email: string
      name: string
      companyId: string
      canApprove: boolean
      companyTier: string
    }
  }
}