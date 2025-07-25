"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Clock, ClockIcon as ClockIn, ClockIcon as ClockOut, Calendar, User, MapPin } from "lucide-react"
import { createFichaje, getFichajesUsuario, getEstadoPresencia } from "@/lib/db"
import { toast } from "@/hooks/use-toast"

interface Fichaje {
  id: string
  tipo: "presencia" | "trabajo"
  tipo_fichaje: "entrada" | "salida"
  fecha_hora: string
  observaciones?: string
  parte_trabajo_id?: string
}

export default function FichajesPage() {
  const [fichajes, setFichajes] = useState<Fichaje[]>([])
  const [estadoPresencia, setEstadoPresencia] = useState<"presente" | "ausente">("ausente")
  const [isLoading, setIsLoading] = useState(false)
  const [loadingFichajes, setLoadingFichajes] = useState(true)

  // Usuario mock - en producción vendría del contexto de autenticación
  const usuario = {
    id: "11111111-1111-1111-1111-111111111111",
    nombre: "Administrador",
    apellidos: "Sistema",
  }

  const cargarFichajes = async () => {
    setLoadingFichajes(true)
    try {
      const hoy = new Date().toISOString().split("T")[0]
      const fichajesData = await getFichajesUsuario(usuario.id, hoy)
      setFichajes(fichajesData)
    } catch (error) {
      console.error("Error cargando fichajes:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los fichajes",
        variant: "destructive",
      })
    } finally {
      setLoadingFichajes(false)
    }
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
    cargarFichajes()
    cargarEstadoPresencia()

    // Escuchar eventos de fichaje para sincronizar
    const handleFichajeUpdate = () => {
      cargarFichajes()
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
        observaciones: `Fichaje de ${tipoFichaje} desde página de fichajes`,
      })

      if (result.success) {
        setEstadoPresencia(tipoFichaje === "entrada" ? "presente" : "ausente")

        // Disparar evento para sincronizar otros componentes
        window.dispatchEvent(new CustomEvent("fichajeUpdated"))

        toast({
          title: "Fichaje registrado",
          description: `${tipoFichaje === "entrada" ? "Entrada" : "Salida"} registrada correctamente`,
        })

        // Recargar fichajes
        cargarFichajes()
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

  const formatearFecha = (fechaHora: string) => {
    const fecha = new Date(fechaHora)
    return {
      fecha: fecha.toLocaleDateString("es-ES"),
      hora: fecha.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }
  }

  const getUltimoFichaje = () => {
    if (fichajes.length === 0) return null
    return fichajes[0]
  }

  const ultimoFichaje = getUltimoFichaje()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Control de Fichajes</h1>
          <p className="text-muted-foreground">Gestiona tu horario de trabajo y presencia</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Panel de Estado Actual */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Estado Actual
            </CardTitle>
            <CardDescription>Tu estado de presencia actual</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Estado:</span>
              <Badge
                variant={estadoPresencia === "presente" ? "default" : "secondary"}
                className={estadoPresencia === "presente" ? "bg-green-500" : "bg-gray-500"}
              >
                {estadoPresencia === "presente" ? "Presente" : "Ausente"}
              </Badge>
            </div>

            {ultimoFichaje && (
              <div className="space-y-2">
                <Separator />
                <div className="text-sm">
                  <p className="font-medium">Último fichaje:</p>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      {ultimoFichaje.tipo_fichaje === "entrada" ? "Entrada" : "Salida"} -{" "}
                      {formatearFecha(ultimoFichaje.fecha_hora).hora}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <Separator />

            {/* Botones de fichaje sincronizados */}
            <div className="flex gap-2">
              <Button
                onClick={() => handleFichaje("entrada")}
                disabled={isLoading || estadoPresencia === "presente"}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <ClockIn className="h-4 w-4 mr-2" />
                {isLoading ? "Fichando..." : "Fichar Entrada"}
              </Button>

              <Button
                onClick={() => handleFichaje("salida")}
                disabled={isLoading || estadoPresencia === "ausente"}
                variant="outline"
                className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
              >
                <ClockOut className="h-4 w-4 mr-2" />
                {isLoading ? "Fichando..." : "Fichar Salida"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Panel de Fichajes del Día */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Fichajes de Hoy
            </CardTitle>
            <CardDescription>Registro de entradas y salidas del día actual</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingFichajes ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : fichajes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay fichajes registrados hoy</p>
              </div>
            ) : (
              <div className="space-y-3">
                {fichajes.map((fichaje) => {
                  const { fecha, hora } = formatearFecha(fichaje.fecha_hora)
                  return (
                    <div key={fichaje.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {fichaje.tipo_fichaje === "entrada" ? (
                          <ClockIn className="h-4 w-4 text-green-600" />
                        ) : (
                          <ClockOut className="h-4 w-4 text-red-600" />
                        )}
                        <div>
                          <p className="font-medium text-sm">
                            {fichaje.tipo_fichaje === "entrada" ? "Entrada" : "Salida"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {fichaje.tipo === "trabajo" ? "Trabajo específico" : "Presencia general"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-sm">{hora}</p>
                        <p className="text-xs text-muted-foreground">{fecha}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Información adicional */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Información del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900">Ubicación</h3>
              <p className="text-sm text-blue-700">Taller Principal</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-900">Turno</h3>
              <p className="text-sm text-green-700">08:00 - 17:00</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <h3 className="font-semibold text-purple-900">Departamento</h3>
              <p className="text-sm text-purple-700">Administración</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
