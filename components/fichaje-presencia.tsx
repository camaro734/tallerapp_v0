"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { LogIn, LogOut } from "lucide-react"
import { fichajesDB } from "@/lib/database"
import { useAuth } from "./auth-provider"
import { toast } from "@/hooks/use-toast"

export function FichajePresencia() {
  const { user } = useAuth()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [ultimoFichaje, setUltimoFichaje] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (user) {
      cargarUltimoFichaje()
    }
  }, [user])

  const cargarUltimoFichaje = async () => {
    if (!user) return

    try {
      const fichaje = await fichajesDB.getUltimoFichajePresencia(user.id)
      setUltimoFichaje(fichaje)
    } catch (error) {
      console.error("Error cargando último fichaje:", error)
    }
  }

  const handleFichaje = async (tipo: "entrada" | "salida") => {
    if (!user) return

    setIsLoading(true)
    try {
      await fichajesDB.create({
        usuario_id: user.id,
        tipo,
        fecha_hora: new Date().toISOString(),
        parte_trabajo_id: null,
        observaciones: `Fichaje de ${tipo} - Presencia general`,
      })

      await cargarUltimoFichaje()

      toast({
        title: "Fichaje registrado",
        description: `${tipo === "entrada" ? "Entrada" : "Salida"} registrada correctamente`,
      })
    } catch (error) {
      console.error("Error en fichaje:", error)
      toast({
        title: "Error",
        description: "No se pudo registrar el fichaje",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const estaEnTrabajo = ultimoFichaje?.tipo === "entrada"

  return (
    <Card className="bg-blue-800/50 border-blue-700">
      <CardContent className="p-4">
        <div className="text-center space-y-3">
          {/* Reloj */}
          <div className="space-y-1">
            <div className="text-2xl font-mono font-bold text-white">{formatTime(currentTime)}</div>
            <div className="text-xs text-blue-200">{formatDate(currentTime)}</div>
          </div>

          {/* Estado actual */}
          <div className="flex items-center justify-center gap-2">
            <div className={`w-2 h-2 rounded-full ${estaEnTrabajo ? "bg-green-400" : "bg-red-400"}`} />
            <span className="text-xs text-blue-100">{estaEnTrabajo ? "DENTRO" : "FUERA"}</span>
          </div>

          {/* Último fichaje */}
          {ultimoFichaje && (
            <div className="text-xs text-blue-200">
              Último: {ultimoFichaje.tipo === "entrada" ? "Entrada" : "Salida"} -{" "}
              {new Date(ultimoFichaje.fecha_hora).toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          )}

          {/* Botones de fichaje */}
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => handleFichaje("entrada")}
              disabled={isLoading || estaEnTrabajo}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs"
            >
              <LogIn className="h-3 w-3 mr-1" />
              Entrada
            </Button>
            <Button
              size="sm"
              onClick={() => handleFichaje("salida")}
              disabled={isLoading || !estaEnTrabajo}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs"
            >
              <LogOut className="h-3 w-3 mr-1" />
              Salida
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
