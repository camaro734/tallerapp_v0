"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { Clock, User, Play, Square, Loader2 } from "lucide-react"
import { getUltimoFichajePresencia, createFichajePresencia } from "@/lib/db"

export function FichajePresencia() {
  const { user } = useAuth()
  const [estadoPresencia, setEstadoPresencia] = useState<"entrada" | "salida" | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [ultimoFichaje, setUltimoFichaje] = useState<string | null>(null)

  useEffect(() => {
    if (user?.id) {
      cargarEstadoPresencia()
    }
  }, [user])

  // Escuchar eventos de fichaje del header
  useEffect(() => {
    const handleFichajeUpdate = () => {
      if (user?.id) {
        cargarEstadoPresencia()
      }
    }

    window.addEventListener("fichajeUpdated", handleFichajeUpdate)
    return () => window.removeEventListener("fichajeUpdated", handleFichajeUpdate)
  }, [user])

  const cargarEstadoPresencia = async () => {
    if (!user?.id) return

    try {
      const { data: fichaje } = await getUltimoFichajePresencia(user.id)
      if (fichaje) {
        setEstadoPresencia(fichaje.tipo_fichaje)
        setUltimoFichaje(fichaje.fecha_hora)
      } else {
        setEstadoPresencia("salida") // Por defecto ausente
      }
    } catch (error) {
      console.error("Error cargando estado de presencia:", error)
    }
  }

  const handleFichajePresencia = async (tipo: "entrada" | "salida") => {
    if (!user?.id) return

    setIsLoading(true)

    try {
      const { data, error } = await createFichajePresencia(user.id, tipo)

      if (error) {
        throw new Error(error.message || "Error en el fichaje")
      }

      setEstadoPresencia(tipo)
      setUltimoFichaje(new Date().toISOString())

      toast({
        title: "Fichaje registrado",
        description: `Has fichado ${tipo === "entrada" ? "la entrada" : "la salida"} correctamente`,
      })

      // Disparar evento para sincronizar con el header
      window.dispatchEvent(
        new CustomEvent("fichajeUpdated", {
          detail: { tipo, timestamp: new Date().toISOString() },
        }),
      )
    } catch (error) {
      console.error("Error en fichaje de presencia:", error)
      toast({
        title: "Error",
        description: "No se pudo registrar el fichaje de presencia",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) return null

  const estaPresente = estadoPresencia === "entrada"

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-600" />
          Control de Presencia
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-gray-400" />
              <span className="font-medium">{user.nombre}</span>
            </div>
            <Badge
              variant={estaPresente ? "default" : "secondary"}
              className={estaPresente ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
            >
              {estaPresente ? "Presente" : "Ausente"}
            </Badge>
            {ultimoFichaje && (
              <span className="text-sm text-gray-500">
                Último:{" "}
                {new Date(ultimoFichaje).toLocaleTimeString("es-ES", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => handleFichajePresencia("entrada")}
              disabled={isLoading || estaPresente}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
              Fichar Entrada
            </Button>
            <Button
              onClick={() => handleFichajePresencia("salida")}
              disabled={isLoading || !estaPresente}
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Square className="h-4 w-4 mr-2" />}
              Fichar Salida
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
