import React, { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { User, AuthContextType } from '../types'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('user'))
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user

  const login = async (username: string, password: string): Promise<void> => {
    try {
      setIsLoading(true)
      
      // Validación simple local - el API no requiere autenticación JWT
      if (username && password) {
        const userData: User = {
          id: '1',
          username: username.includes('@') ? username.split('@')[0] : username,
          email: username,
          full_name: username.includes('@') ? username.split('@')[0] : username,
          is_active: true,
          created_at: new Date().toISOString()
        }
        
        // Guardar usuario en localStorage
        localStorage.setItem('user', JSON.stringify(userData))
        setUser(userData)
        setToken('logged-in')
        
      } else {
        throw new Error('Email y contraseña son requeridos')
      }
      
    } catch (error: any) {
      console.error('Error de login:', error)
      throw new Error(error.message || 'Error de autenticación')
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  const checkAuth = async (): Promise<void> => {
    const storedUser = localStorage.getItem('user')
    
    if (!storedUser) {
      setIsLoading(false)
      return
    }

    try {
      const userData = JSON.parse(storedUser)
      setUser(userData)
      setToken('logged-in')
    } catch (error) {
      console.error('Error verificando autenticación:', error)
      logout()
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext