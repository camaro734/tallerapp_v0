"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, LogOut, User, Settings, Clock } from "lucide-react"
import { createFichajePresencia, getUltimoFichajePresencia } from "@/lib/database"
import { useEffect } from "react"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isPresent, setIsPresent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [lastFichaje, setLastFichaje] = useState<any>(null)

  // Check current presence status
  useEffect(() => {
    const checkPresenceStatus = async () => {
      if (!user) return

      try {
        const { data } = await getUltimoFichajePresencia(user.id)
        if (data) {
          setLastFichaje(data)
          setIsPresent(data.tipo_fichaje === "entrada")
        }
      } catch (error) {
        console.error("Error checking presence:", error)
      }
    }

    checkPresenceStatus()

    // Listen for fichaje updates
    const handleFichajeUpdate = () => {
      checkPresenceStatus()
    }

    window.addEventListener("fichajeUpdated", handleFichajeUpdate)
    return () => window.removeEventListener("fichajeUpdated", handleFichajeUpdate)
  }, [user])

  const handleFichaje = async () => {
    if (!user || isLoading) return

    setIsLoading(true)
    try {
      const tipoFichaje = isPresent ? "salida" : "entrada"
      const { data, error } = await createFichajePresencia(user.id, tipoFichaje)

      if (error) {
        toast({
          title: "Error",
          description: "No se pudo registrar el fichaje",
          variant: "destructive",
        })
        return
      }

      setIsPresent(!isPresent)
      setLastFichaje(data)

      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent("fichajeUpdated"))

      toast({
        title: "Fichaje registrado",
        description: `${tipoFichaje === "entrada" ? "Entrada" : "Salida"} registrada correctamente`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al procesar el fichaje",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
              <div className="hidden lg:block">
                <h1 className="text-lg font-semibold text-gray-900">CMG Hidráulica</h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Fichaje button */}
              <Button
                onClick={handleFichaje}
                disabled={isLoading}
                size="sm"
                variant={isPresent ? "destructive" : "default"}
                className="flex items-center gap-2"
              >
                <Clock className="h-4 w-4" />
                {isLoading ? "..." : isPresent ? "Salida" : "Entrada"}
              </Button>

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder-user.jpg" alt={user.nombre} />
                      <AvatarFallback>
                        {user.nombre.charAt(0)}
                        {user.apellidos.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.nombre} {user.apellidos}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      <Badge variant="outline" className="w-fit text-xs">
                        {user.rol === "admin" && "Administrador"}
                        {user.rol === "jefe_taller" && "Jefe de Taller"}
                        {user.rol === "tecnico" && "Técnico"}
                        {user.rol === "recepcion" && "Recepción"}
                      </Badge>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configuración</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="relative">{children}</main>
      </div>
    </div>
  )
}
