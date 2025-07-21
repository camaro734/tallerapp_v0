"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { authenticateUser, getUserById } from "@/lib/db"
import type { Usuario } from "@/lib/db"

interface AuthContextType {
  user: Usuario | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on mount
    const checkSession = async () => {
      try {
        const savedUserId = localStorage.getItem("cmg_user_id")
        if (savedUserId) {
          const { data: userData } = await getUserById(savedUserId)
          if (userData && userData.activo) {
            setUser(userData)
          } else {
            localStorage.removeItem("cmg_user_id")
          }
        }
      } catch (error) {
        console.error("Error checking session:", error)
        localStorage.removeItem("cmg_user_id")
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true)

      const response = await authenticateUser(email, password)

      if (response.data && response.data.activo) {
        setUser(response.data)
        localStorage.setItem("cmg_user_id", response.data.id)
        return { success: true }
      } else {
        const errorMessage = response.error?.message || "Credenciales inválidas o usuario inactivo"
        return { success: false, error: errorMessage }
      }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, error: "Error al iniciar sesión. Inténtalo de nuevo." }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("cmg_user_id")
  }

  const value = {
    user,
    login,
    logout,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
