import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

const prisma = new PrismaClient()

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'credentials',
      credentials: {
        phoneNumber: { label: 'Phone Number', type: 'text' },
        pin: { label: 'PIN', type: 'password' },
        userType: { label: 'User Type', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.phoneNumber || !credentials?.pin) {
          return null
        }

        try {
          // Clean phone number (remove formatting)
          const cleanPhoneNumber = credentials.phoneNumber.replace(/\D/g, '')
          
          // Find user by phone number and user type
          const user = await prisma.user.findFirst({
            where: {
              phoneNumber: {
                contains: cleanPhoneNumber.slice(-9), // Last 9 digits for flexibility
              },
              userType: credentials.userType as 'CUSTOMER' | 'AGENT',
              isActive: true,
            },
            include: {
              profile: true,
            },
          })

          if (!user || !user.pin) {
            return null
          }

          // Verify PIN
          const isValidPin = await bcrypt.compare(credentials.pin, user.pin)
          if (!isValidPin) {
            return null
          }

          // Update last login
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          })

          // Return user object for session
          return {
            id: user.id,
            phoneNumber: user.phoneNumber,
            userType: user.userType,
            profile: user.profile
              ? {
                  firstName: user.profile.firstName,
                  lastName: user.profile.lastName,
                  coinBalance: user.profile.coinBalance,
                }
              : null,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.phoneNumber = user.phoneNumber
        token.userType = user.userType
        token.profile = user.profile
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id as string,
          phoneNumber: token.phoneNumber as string,
          userType: token.userType as 'CUSTOMER' | 'AGENT',
          profile: token.profile as any,
        }
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}
