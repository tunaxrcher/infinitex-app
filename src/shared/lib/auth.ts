import bcrypt from 'bcryptjs'
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

import { prisma } from './db'
import { checkRateLimit } from './rate-limit'

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
          
          // Rate limiting based on phone number
          const rateLimit = checkRateLimit(cleanPhoneNumber)
          if (!rateLimit.allowed) {
            console.log('Rate limit exceeded for:', cleanPhoneNumber)
            throw new Error(`Too many attempts. Try again after ${rateLimit.blockedUntil?.toLocaleTimeString()}`)
          }
          
          if (process.env.NODE_ENV === 'development') {
            console.log('Auth attempt:', {
              providedPhone: credentials.phoneNumber,
              cleanPhone: cleanPhoneNumber,
              userType: credentials.userType,
              pin: credentials.pin.substring(0, 2) + '**', // Hide full PIN in logs
              remainingAttempts: rateLimit.remainingAttempts
            })
          }
          
          // Find user by phone number and user type
          // Try exact match first, then try with different formatting
          let user = await prisma.user.findFirst({
            where: {
              phoneNumber: cleanPhoneNumber,
              userType: credentials.userType as 'CUSTOMER' | 'AGENT',
              isActive: true,
            },
            include: {
              profile: true,
            },
          })

          // If not found, try alternative phone number format searches
          if (!user) {
            // Try with contains for last 9 digits (most flexible)
            const lastNineDigits = cleanPhoneNumber.slice(-9)
            
            user = await prisma.user.findFirst({
              where: {
                phoneNumber: {
                  contains: lastNineDigits,
                },
                userType: credentials.userType as 'CUSTOMER' | 'AGENT',
                isActive: true,
              },
              include: {
                profile: true,
              },
            })
          }

          if (process.env.NODE_ENV === 'development' && !user) {
            // Debug information only in development
            const allUsers = await prisma.user.findMany({
              select: {
                id: true,
                phoneNumber: true,
                userType: true,
                isActive: true,
              },
              take: 10,
            })
            console.log('Available users:', allUsers)
          }

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
    maxAge: 8 * 60 * 60, // 8 hours (more secure for financial app)
    updateAge: 2 * 60 * 60, // Update session every 2 hours
  },
  jwt: {
    maxAge: 8 * 60 * 60, // 8 hours
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
