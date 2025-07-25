"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"
import { Clock, User, Play, Square, Loader2, Calendar, FileText } from "lucide-react"
import { getFichajesUsuario, getUltimoFichajePresencia, createFichajePresencia } from "@/lib/db"

interface Fichaje {
  id: string
  fecha_hora: string
  tipo_fichaje: "entrada" | "salida"
  usuario_id: string
  usuario?: {
    nombre: string
  }
}

export default function FichajesPage() {
  const { user } = useAuth()
  const [fichajes, setFichajes] = useState<Fichaje[]>([])
  const [estadoPresencia, setEstadoPresencia] = useState<"entrada" | "salida" | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [ultimoFichaje, setUltimoFichaje] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      cargarFichajes()
      cargarEstadoPresencia()
    }
  }, [user])

  // Escuchar eventos de fichaje desde otros componentes
  useEffect(() => {
    const handleFichajeUpdate = () => {
      if (user) {
        cargarFichajes()
        cargarEstadoPresencia()
      }
    }

    window.addEventListener("fichajeUpdated", handleFichajeUpdate)
    return () => window.removeEventListener("fichajeUpdated", handleFichajeUpdate)
  }, [user])

  const cargarFichajes = async () => {
    if (!user) return

    try {
      const { data } = await getFichajesUsuario(user.id)
      if (data) {
        setFichajes(data)
      }
    } catch (error) {
      console.error("Error cargando fichajes:", error)
    }
  }

  const cargarEstadoPresencia = async () => {
    if (!user) return

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
    if (!user) return

    setIsLoading(true)

    try {
      const { data, error } = await createFichajePresencia(user.id, tipo)

      if (error) {
        throw new Error(error.message || "Error en el fichaje")
      }

      setEstadoPresencia(tipo)
      setUltimoFichaje(new Date().toISOString())
      await cargarFichajes()

      toast({
        title: "Fichaje registrado",
        description: `Has fichado ${tipo === "entrada" ? "la entrada" : "la salida"} correctamente`,
      })

      // Disparar evento para sincronizar con otros componentes
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

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <p>Debes iniciar sesión para ver los fichajes</p>
        </div>
      </div>
    )
  }

  const estaPresente = estadoPresencia === "entrada"

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Control de Fichajes</h1>
          <p className="text-gray-600 mt-1">Gestiona tu tiempo de trabajo y presencia</p>
        </div>
      </div>

      {/* Control de Presencia */}
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

      {/* Historial de Fichajes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Historial de Fichajes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {fichajes.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No hay fichajes registrados</p>
            </div>
          ) : (
            <div className="space-y-3">
              {fichajes.map((fichaje, index) => (
                <div key={fichaje.id}>
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          fichaje.tipo_fichaje === "entrada" ? "bg-green-500" : "bg-red-500"
                        }`}
                      />
                      <div>
                        <p className="font-medium">{fichaje.tipo_fichaje === "entrada" ? "Entrada" : "Salida"}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(fichaje.fecha_hora).toLocaleDateString("es-ES", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-lg">
                        {new Date(fichaje.fecha_hora).toLocaleTimeString("es-ES", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <Badge
                        variant={fichaje.tipo_fichaje === "entrada" ? "default" : "secondary"}
                        className={
                          fichaje.tipo_fichaje === "entrada" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }
                      >
                        {fichaje.tipo_fichaje === "entrada" ? "Entrada" : "Salida"}
                      </Badge>
                    </div>
                  </div>
                  {index < fichajes.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
