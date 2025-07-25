"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { authenticateUser, type Usuario } from "@/lib/database"

interface AuthContextType {
  user: Usuario | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem("cmg-user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error("Error parsing stored user:", error)
        localStorage.removeItem("cmg-user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const result = await authenticateUser(email, password)
      if (result.data && !result.error) {
        setUser(result.data)
        localStorage.setItem("cmg-user", JSON.stringify(result.data))
        return true
      }
      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("cmg-user")
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

// Permission functions
export const canViewAllWorkOrders = (rol?: string): boolean =>
  !!rol && ["admin", "jefe_taller", "recepcion"].includes(rol)

export const canCreateWorkOrders = (rol?: string): boolean =>
  !!rol && ["admin", "jefe_taller", "recepcion"].includes(rol)

export const canEditWorkOrders = (rol?: string): boolean => !!rol && ["admin", "jefe_taller"].includes(rol)

export const canValidateWorkOrders = (rol?: string): boolean => !!rol && ["admin", "jefe_taller"].includes(rol)

export const canManageUsers = (rol?: string): boolean => rol === "admin"

export const canManageSettings = (rol?: string): boolean => rol === "admin"

export const canCreateAppointments = (rol?: string): boolean =>
  !!rol && ["admin", "jefe_taller", "recepcion"].includes(rol)

export const canManageClients = (rol?: string): boolean => !!rol && ["admin", "jefe_taller", "recepcion"].includes(rol)

export const canManageMaterials = (rol?: string): boolean =>
  !!rol && ["admin", "jefe_taller", "recepcion"].includes(rol)

export const canManagePersonal = (rol?: string): boolean => !!rol && ["admin", "jefe_taller"].includes(rol)

export const canManageVacations = (rol?: string): boolean => !!rol && ["admin", "jefe_taller"].includes(rol)

export const canViewReports = (rol?: string): boolean => !!rol && ["admin", "jefe_taller", "recepcion"].includes(rol)

export const canManageInventory = (rol?: string): boolean => !!rol && ["admin", "jefe_taller"].includes(rol)

// Helper functions for specific roles
export const isAdmin = (rol?: string): boolean => rol === "admin"
export const isJefeTaller = (rol?: string): boolean => rol === "jefe_taller"
export const isTecnico = (rol?: string): boolean => rol === "tecnico"
export const isRecepcion = (rol?: string): boolean => rol === "recepcion"

// Combined permission checks
export const canAccessAdminPanel = (rol?: string): boolean => isAdmin(rol)
export const canManageWorkflow = (rol?: string): boolean => !!rol && ["admin", "jefe_taller"].includes(rol)
export const canViewAllData = (rol?: string): boolean => !!rol && ["admin", "jefe_taller", "recepcion"].includes(rol)
