"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { LogOut, Settings, User, Clock, ClockIcon as ClockIn, ClockIcon as ClockOut } from "lucide-react"
import { Sidebar } from "./sidebar"
import { DatabaseStatus } from "./database-status"
import { createFichaje, getEstadoPresencia } from "@/lib/db"
import { toast } from "@/hooks/use-toast"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const [estadoPresencia, setEstadoPresencia] = useState<"presente" | "ausente">("ausente")
  const [isLoading, setIsLoading] = useState(false)
  const [showDatabaseStatus, setShowDatabaseStatus] = useState(false)

  // Usuario mock - en producción vendría del contexto de autenticación
  const usuario = {
    id: "11111111-1111-1111-1111-111111111111",
    nombre: "Administrador",
    apellidos: "Sistema",
    email: "admin@cmgplataformas.com",
    rol: "admin",
  }

  const cargarEstadoPresencia = async () => {
    try {
      const estado = await getEstadoPresencia(usuario.id)
      setEstadoPresencia(estado)
    } catch (error) {
      console.error("Error cargando estado de presencia:", error)
    }
  }

  useEffect(() => {
    cargarEstadoPresencia()

    // Escuchar eventos de fichaje para sincronizar
    const handleFichajeUpdate = () => {
      cargarEstadoPresencia()
    }

    window.addEventListener("fichajeUpdated", handleFichajeUpdate)
    return () => window.removeEventListener("fichajeUpdated", handleFichajeUpdate)
  }, [])

  const handleFichaje = async (tipoFichaje: "entrada" | "salida") => {
    setIsLoading(true)
    try {
      const result = await createFichaje({
        usuario_id: usuario.id,
        tipo: "presencia",
        tipo_fichaje: tipoFichaje,
        observaciones: `Fichaje de ${tipoFichaje} desde header`,
      })

      if (result.success) {
        setEstadoPresencia(tipoFichaje === "entrada" ? "presente" : "ausente")

        // Disparar evento para sincronizar otros componentes
        window.dispatchEvent(new CustomEvent("fichajeUpdated"))

        toast({
          title: "Fichaje registrado",
          description: `${tipoFichaje === "entrada" ? "Entrada" : "Salida"} registrada correctamente`,
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "No se pudo registrar el fichaje",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error en fichaje:", error)
      toast({
        title: "Error",
        description: "Error al registrar el fichaje",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getFichajeButton = () => {
    if (estadoPresencia === "ausente") {
      return (
        <Button
          onClick={() => handleFichaje("entrada")}
          disabled={isLoading}
          size="sm"
          className="bg-green-600 hover:bg-green-700"
        >
          <ClockIn className="h-4 w-4 mr-1" />
          {isLoading ? "Fichando..." : "Entrada"}
        </Button>
      )
    } else {
      return (
        <Button
          onClick={() => handleFichaje("salida")}
          disabled={isLoading}
          size="sm"
          variant="outline"
          className="border-red-200 text-red-700 hover:bg-red-50"
        >
          <ClockOut className="h-4 w-4 mr-1" />
          {isLoading ? "Fichando..." : "Salida"}
        </Button>
      )
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">CMG Hidráulica</h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Botón de fichaje sincronizado */}
              {getFichajeButton()}

              {/* Botón de estado de base de datos */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDatabaseStatus(!showDatabaseStatus)}
                className="text-xs"
              >
                DB Status
              </Button>

              {/* Menú de usuario */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-blue-500 text-white">
                        {usuario.nombre.charAt(0)}
                        {usuario.apellidos.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">
                        {usuario.nombre} {usuario.apellidos}
                      </p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">{usuario.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Clock className="mr-2 h-4 w-4" />
                    <span>Mis Fichajes</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configuración</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Database Status Panel */}
        {showDatabaseStatus && (
          <div className="bg-white border-b p-4">
            <DatabaseStatus />
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
