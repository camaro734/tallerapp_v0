"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { authenticateUser, type Usuario } from "@/lib/database"

interface AuthContextType {
  user: Usuario | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem("cmg_user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        localStorage.removeItem("cmg_user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await authenticateUser(email, password)

      if (error || !data) {
        return { success: false, error: "Credenciales inválidas" }
      }

      setUser(data)
      localStorage.setItem("cmg_user", JSON.stringify(data))
      return { success: true }
    } catch (error) {
      return { success: false, error: "Error de conexión" }
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

// Permission helper functions
export function canApproveVacations(rol?: string): boolean {
  return rol === "admin" || rol === "jefe_taller"
}

export function canRequestVacations(rol?: string): boolean {
  return !!rol // Any authenticated user can request vacations
}

export function canManageUsers(rol?: string): boolean {
  return rol === "admin"
}

export function canViewAllWorkOrders(rol?: string): boolean {
  return !!rol && ["admin", "jefe_taller", "recepcion"].includes(rol)
}

export function canCreateWorkOrders(rol?: string): boolean {
  return !!rol && ["admin", "jefe_taller", "recepcion"].includes(rol)
}

export function canEditWorkOrders(rol?: string): boolean {
  return !!rol && ["admin", "jefe_taller"].includes(rol)
}

export function canValidateWorkOrders(rol?: string): boolean {
  return !!rol && ["admin", "jefe_taller"].includes(rol)
}

export function canManageSettings(rol?: string): boolean {
  return rol === "admin"
}

export function canCreateAppointments(rol?: string): boolean {
  return !!rol && ["admin", "jefe_taller", "recepcion"].includes(rol)
}

export function canManageClients(rol?: string): boolean {
  return !!rol && ["admin", "jefe_taller", "recepcion"].includes(rol)
}

export function canManageMaterials(rol?: string): boolean {
  return !!rol && ["admin", "jefe_taller", "recepcion"].includes(rol)
}

export function canViewPersonnel(rol?: string): boolean {
  return !!rol && ["admin", "jefe_taller", "recepcion"].includes(rol)
}

export function canManagePersonnel(rol?: string): boolean {
  return !!rol && ["admin", "jefe_taller"].includes(rol)
}

export function canCreatePersonnel(rol?: string): boolean {
  return rol === "admin"
}

export function canEditPersonnel(rol?: string): boolean {
  return rol === "admin"
}

export function canDeletePersonnel(rol?: string): boolean {
  return rol === "admin"
}

export function canViewReports(rol?: string): boolean {
  return !!rol && ["admin", "jefe_taller", "recepcion"].includes(rol)
}

export function canGenerateReports(rol?: string): boolean {
  return !!rol && ["admin", "jefe_taller"].includes(rol)
}

export function canViewAllTimeTracking(rol?: string): boolean {
  return !!rol && ["admin", "jefe_taller"].includes(rol)
}

export function canManageTimeTracking(rol?: string): boolean {
  return !!rol && ["admin", "jefe_taller"].includes(rol)
}

export function canManageVacations(rol?: string): boolean {
  return !!rol && ["admin", "jefe_taller"].includes(rol)
}

export function canViewAllVacations(rol?: string): boolean {
  return !!rol && ["admin", "jefe_taller", "recepcion"].includes(rol)
}

export function canManageSchedule(rol?: string): boolean {
  return !!rol && ["admin", "jefe_taller", "recepcion"].includes(rol)
}

export function canViewSchedule(rol?: string): boolean {
  return !!rol && ["admin", "jefe_taller", "recepcion", "tecnico"].includes(rol)
}

export function canManageVehicles(rol?: string): boolean {
  return !!rol && ["admin", "jefe_taller", "recepcion"].includes(rol)
}

export function canViewVehicles(rol?: string): boolean {
  return !!rol && ["admin", "jefe_taller", "recepcion", "tecnico"].includes(rol)
}

export function canViewMaterials(rol?: string): boolean {
  return !!rol && ["admin", "jefe_taller", "recepcion", "tecnico"].includes(rol)
}

export function canCreateMaterials(rol?: string): boolean {
  return !!rol && ["admin", "jefe_taller"].includes(rol)
}

export function canEditMaterials(rol?: string): boolean {
  return !!rol && ["admin", "jefe_taller"].includes(rol)
}

export function canDeleteMaterials(rol?: string): boolean {
  return rol === "admin"
}

export function canViewClients(rol?: string): boolean {
  return !!rol && ["admin", "jefe_taller", "recepcion", "tecnico"].includes(rol)
}

export function canCreateClients(rol?: string): boolean {
  return !!rol && ["admin", "jefe_taller", "recepcion"].includes(rol)
}

export function canEditClients(rol?: string): boolean {
  return !!rol && ["admin", "jefe_taller"].includes(rol)
}

export function canDeleteClients(rol?: string): boolean {
  return rol === "admin"
}

export function canImportData(rol?: string): boolean {
  return !!rol && ["admin", "jefe_taller"].includes(rol)
}

export function canExportData(rol?: string): boolean {
  return !!rol && ["admin", "jefe_taller", "recepcion"].includes(rol)
}

// Helper function to check if user has admin privileges
export function isAdmin(rol?: string): boolean {
  return rol === "admin"
}

// Helper function to check if user is a manager
export function isManager(rol?: string): boolean {
  return rol === "jefe_taller"
}

// Helper function to check if user is a technician
export function isTechnician(rol?: string): boolean {
  return rol === "tecnico"
}

// Helper function to check if user is reception staff
export function isReception(rol?: string): boolean {
  return rol === "recepcion"
}
