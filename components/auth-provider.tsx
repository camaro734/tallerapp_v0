"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { supabase, isSupabaseReady } from "@/lib/supabase"
import { usuariosDB } from "@/lib/database"
import type { Usuario } from "@/lib/supabase"

export type UserRole = "admin" | "jefe_taller" | "tecnico"

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
    const checkSession = async () => {
      try {
        if (isSupabaseReady()) {
          const {
            data: { session },
          } = await supabase!.auth.getSession()
          if (session?.user) {
            const userData = await usuariosDB.getByEmail(session.user.email!)
            setUser(userData)
          }
        } else {
          // Modo mock: verificar localStorage
          const savedUser = localStorage.getItem("cmg-user")
          if (savedUser) {
            setUser(JSON.parse(savedUser))
          }
        }
      } catch (error) {
        console.error("Error checking session:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()

    if (isSupabaseReady()) {
      // Escuchar cambios de autenticación solo si Supabase está configurado
      const {
        data: { subscription },
      } = supabase!.auth.onAuthStateChange(async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          const userData = await usuariosDB.getByEmail(session.user.email!)
          setUser(userData)
        } else if (event === "SIGNED_OUT") {
          setUser(null)
        }
      })

      return () => subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Verificar si el usuario existe en nuestra base de datos
      const userData = await usuariosDB.getByEmail(email)
      if (!userData || !userData.activo) {
        return false
      }

      if (isSupabaseReady()) {
        // Modo Supabase
        const { data, error } = await supabase!.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          // Si el usuario no existe en Auth, crearlo
          if (error.message.includes("Invalid login credentials")) {
            const { error: signUpError } = await supabase!.auth.signUp({
              email,
              password,
              options: {
                data: {
                  nombre: userData.nombre,
                  rol: userData.rol,
                },
              },
            })

            if (signUpError) {
              console.error("Error creating auth user:", signUpError)
              return false
            }

            // Intentar login nuevamente
            const { error: loginError } = await supabase!.auth.signInWithPassword({
              email,
              password,
            })

            if (loginError) {
              console.error("Error logging in after signup:", loginError)
              return false
            }
          } else {
            console.error("Login error:", error)
            return false
          }
        }
      } else {
        // Modo mock: verificar contraseña simple
        if (password !== "123456") {
          return false
        }
        localStorage.setItem("cmg-user", JSON.stringify(userData))
      }

      setUser(userData)
      return true
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  const logout = async () => {
    if (isSupabaseReady()) {
      await supabase!.auth.signOut()
    } else {
      localStorage.removeItem("cmg-user")
    }
    setUser(null)
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
