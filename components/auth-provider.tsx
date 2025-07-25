"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { usuariosDB } from "@/lib/database"

interface User {
  id: string
  nombre: string
  email: string
  rol: "admin" | "jefe_taller" | "tecnico" | "recepcion"
  activo: boolean
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const savedUser = localStorage.getItem("currentUser")
    if (savedUser) {
      const userData = JSON.parse(savedUser)
      setUser(userData)
      setIsAuthenticated(true)
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simple authentication - in production, this would be handled by Supabase Auth
    const foundUser = usuariosDB.find((u) => u.email === email && u.activo)

    if (foundUser && password === "password123") {
      // Simple password for demo
      const userSession = {
        id: foundUser.id,
        nombre: foundUser.nombre,
        email: foundUser.email,
        rol: foundUser.rol,
        activo: foundUser.activo,
      }

      setUser(userSession)
      setIsAuthenticated(true)
      localStorage.setItem("currentUser", JSON.stringify(userSession))
      return true
    }

    return false
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem("currentUser")
  }

  return <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Permission functions
export function canManageUsers(user: User | null): boolean {
  return user?.rol === "admin"
}

export function canManageClients(user: User | null): boolean {
  return user?.rol === "admin" || user?.rol === "recepcion"
}

export function canManageVehicles(user: User | null): boolean {
  return user?.rol === "admin" || user?.rol === "recepcion"
}

export function canManageMaterials(user: User | null): boolean {
  return user?.rol === "admin" || user?.rol === "jefe_taller"
}

export function canManageWorkOrders(user: User | null): boolean {
  return user?.rol === "admin" || user?.rol === "jefe_taller" || user?.rol === "tecnico"
}

export function canManageTimeTracking(user: User | null): boolean {
  return user?.rol === "admin" || user?.rol === "jefe_taller"
}

export function canManageSchedule(user: User | null): boolean {
  return user?.rol === "admin" || user?.rol === "recepcion"
}

export function canManageVacations(user: User | null): boolean {
  return user?.rol === "admin" || user?.rol === "jefe_taller"
}

export function canViewReports(user: User | null): boolean {
  return user?.rol === "admin" || user?.rol === "jefe_taller"
}

export function canManageSettings(user: User | null): boolean {
  return user?.rol === "admin"
}

// Role check helpers
export function isAdmin(user: User | null): boolean {
  return user?.rol === "admin"
}

export function isJefeTaller(user: User | null): boolean {
  return user?.rol === "jefe_taller"
}

export function isTecnico(user: User | null): boolean {
  return user?.rol === "tecnico"
}

export function isRecepcion(user: User | null): boolean {
  return user?.rol === "recepcion"
}
