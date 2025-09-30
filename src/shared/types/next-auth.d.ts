import { DefaultSession, DefaultUser } from 'next-auth'
import { DefaultJWT, JWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      phoneNumber: string
      userType: 'CUSTOMER' | 'AGENT'
      profile: {
        firstName?: string
        lastName?: string
        coinBalance: number
      } | null
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    id: string
    phoneNumber: string
    userType: 'CUSTOMER' | 'AGENT'
    profile: {
      firstName?: string
      lastName?: string
      coinBalance: number
    } | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string
    phoneNumber: string
    userType: 'CUSTOMER' | 'AGENT'
    profile: {
      firstName?: string
      lastName?: string
      coinBalance: number
    } | null
  }
}
