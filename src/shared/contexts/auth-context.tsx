'use client'

import React, { createContext, useContext } from 'react'
import { signIn, signOut, useSession } from 'next-auth/react'

export type UserType = 'CUSTOMER' | 'AGENT'

export interface User {
  id: string
  phoneNumber: string
  userType: UserType
  profile?: {
    firstName?: string
    lastName?: string
    coinBalance: number
  }
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (
    phoneNumber: string,
    pin: string,
    userType?: UserType
  ) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()

  const login = async (
    phoneNumber: string,
    pin: string,
    userType?: UserType
  ): Promise<boolean> => {
    try {
      const result = await signIn('credentials', {
        phoneNumber,
        pin,
        userType: userType || 'CUSTOMER',
        redirect: false,
      })

      return result?.ok === true
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const logout = async () => {
    await signOut({ redirect: false })
  }

  const user: User | null = session?.user
    ? {
        id: session.user.id,
        phoneNumber: session.user.phoneNumber,
        userType: session.user.userType,
        profile: session.user.profile,
      }
    : null

  const value: AuthContextType = {
    user,
    isLoading: status === 'loading',
    login,
    logout,
    isAuthenticated: !!session?.user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
