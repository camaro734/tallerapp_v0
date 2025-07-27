"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { authenticateUser, type Usuario } from "@/lib/db"

interface AuthContextType {
  user: Usuario | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem("cmg_user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error("Error parsing stored user:", error)
        localStorage.removeItem("cmg_user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const result = await authenticateUser(email, password)

      if (result.data && !result.error) {
        setUser(result.data)
        localStorage.setItem("cmg_user", JSON.stringify(result.data))
        return { success: true }
      } else {
        return { success: false, error: result.error?.message || "Invalid credentials" }
      }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, error: "Login failed" }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("cmg_user")
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
