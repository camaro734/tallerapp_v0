"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/components/auth-provider"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Clock, User, LogIn, LogOut } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { getUltimoFichajePresencia, createFichajePresencia } from "@/lib/db"

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isPresent, setIsPresent] = useState(false)
  const [lastEntry, setLastEntry] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const checkPresenceStatus = useCallback(async () => {
    if (!user) return

    try {
      const { data: lastFichaje, error } = await getUltimoFichajePresencia(user.id)
      if (error) {
        console.error("Error checking presence:", error)
        return
      }

      if (lastFichaje) {
        setIsPresent(lastFichaje.tipo_fichaje === "entrada")
        setLastEntry(
          lastFichaje.tipo_fichaje === "entrada"
            ? `Entrada - ${new Date(lastFichaje.fecha_hora).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
            : `Salida - ${new Date(lastFichaje.fecha_hora).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
        )
      } else {
        setIsPresent(false)
        setLastEntry(null)
      }
    } catch (error) {
      console.error("Error checking presence:", error)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      checkPresenceStatus()
    }
  }, [user, checkPresenceStatus])

  const handleFichaje = async () => {
    if (!user || isLoading) return

    setIsLoading(true)
    try {
      const tipo = isPresent ? "salida" : "entrada"
      await createFichajePresencia(user.id, tipo)
      await checkPresenceStatus()
    } catch (error) {
      console.error("Error en fichaje:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return <div className="min-h-screen bg-gray-50">{children}</div>
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header compacto */}
      <header className="bg-blue-600 text-white">
        {/* Barra superior */}
        <div className="flex items-center justify-between px-4 py-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="text-white hover:bg-blue-700">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <Sidebar />
            </SheetContent>
          </Sheet>

          <h1 className="text-lg font-semibold">CMG Hidráulica</h1>

          <Badge variant="destructive" className="text-xs">
            {user.rol === "admin" ? "Admin" : user.rol === "jefe_taller" ? "Jefe" : "Técnico"}
          </Badge>
        </div>

        {/* Info usuario compacta */}
        <div className="px-4 py-1 bg-blue-700/50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold">
              {user.nombre
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{user.nombre}</p>
              <p className="text-xs text-blue-200 truncate">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Control de presencia ultra compacto */}
        <div className="px-4 py-2 bg-white/10 border-t border-blue-500/30">
          <div className="flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <span className="font-mono font-medium">{formatTime(currentTime)}</span>
              <span className="text-blue-200">{formatDate(currentTime)}</span>
            </div>

            <div className="flex items-center gap-2">
              <User className="h-3 w-3" />
              <span className="truncate max-w-20">{user.nombre.split(" ")[0]}</span>
              <Badge
                variant={isPresent ? "default" : "secondary"}
                className={`h-4 text-xs ${isPresent ? "bg-green-500" : "bg-gray-500"}`}
              >
                {isPresent ? "Presente" : "Ausente"}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              {lastEntry && <span className="text-blue-200 text-xs">{lastEntry}</span>}
              <Button
                size="sm"
                onClick={handleFichaje}
                disabled={isLoading}
                className={`h-6 px-2 text-xs ${
                  isPresent ? "bg-red-500 hover:bg-red-600 text-white" : "bg-green-500 hover:bg-green-600 text-white"
                }`}
              >
                {isLoading ? (
                  "..."
                ) : (
                  <>
                    {isPresent ? <LogOut className="h-3 w-3 mr-1" /> : <LogIn className="h-3 w-3 mr-1" />}
                    {isPresent ? "Salida" : "Entrada"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="flex-1">{children}</main>
    </div>
  )
}
