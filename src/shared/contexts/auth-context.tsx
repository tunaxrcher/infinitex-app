'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

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

// Mock user data for development
const mockUsers: User[] = [
  {
    id: 'customer-1',
    phoneNumber: '0812345678',
    userType: 'CUSTOMER',
    profile: {
      firstName: 'สมชาย',
      lastName: 'ใจดี',
      coinBalance: 150,
    },
  },
  {
    id: 'agent-1',
    phoneNumber: '0887654321',
    userType: 'AGENT',
    profile: {
      firstName: 'สมหญิง',
      lastName: 'ขยันขันแข็ง',
      coinBalance: 0,
    },
  },
]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in (from localStorage or session)
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem('infinitex_user')
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }
      } catch (error) {
        console.error('Error checking auth:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (
    phoneNumber: string,
    pin: string,
    userType?: UserType
  ): Promise<boolean> => {
    setIsLoading(true)

    try {
      // Mock authentication - check against mock users
      // PIN is "1234" for all mock users
      if (pin === '1234') {
        // Remove formatting from phone number for comparison
        const cleanPhoneNumber = phoneNumber.replace(/\D/g, '')

        console.log(
          'Available mock users:',
          mockUsers.map((u) => ({
            id: u.id,
            phone: u.phoneNumber,
            cleanPhone: u.phoneNumber.replace(/\D/g, ''),
            userType: u.userType,
          }))
        )

        console.log('Trying to login with:', {
          originalPhone: phoneNumber,
          cleanPhone: cleanPhoneNumber,
          selectedUserType: userType,
          pin: pin,
        })

        const foundUser = mockUsers.find((u) => {
          const cleanUserPhone = u.phoneNumber.replace(/\D/g, '')
          const phoneMatch = cleanUserPhone === cleanPhoneNumber
          const typeMatch = !userType || u.userType === userType

          console.log(`Checking user ${u.id}:`, {
            userPhone: u.phoneNumber,
            cleanUserPhone,
            userType: u.userType,
            phoneMatch,
            typeMatch,
            finalMatch: phoneMatch && typeMatch,
          })

          return phoneMatch && typeMatch
        })

        if (foundUser) {
          setUser(foundUser)

          // Store in both localStorage and cookies for middleware
          localStorage.setItem('infinitex_user', JSON.stringify(foundUser))

          // Set cookie for server-side access (production should use httpOnly cookies)
          document.cookie = `infinitex_user=${JSON.stringify(foundUser)}; path=/; max-age=86400; samesite=strict`

          return true
        }
      }

      // In production, this would be an API call
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ phoneNumber, pin })
      // })
      // const data = await response.json()
      // if (response.ok) {
      //   setUser(data.user)
      //   localStorage.setItem('infinitex_user', JSON.stringify(data.user))
      //   return true
      // }

      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('infinitex_user')

    // Clear cookie as well
    document.cookie =
      'infinitex_user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
  }

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
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
