"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { MainLayout } from "@/components/main-layout"
import { FichajePresencia } from "@/components/fichaje-presencia"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Clock, FileText, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { getFichajesUsuario, type Fichaje } from "@/lib/db"

export default function FichajesPage() {
  const { user } = useAuth()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [fichajes, setFichajes] = useState<Fichaje[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const cargarFichajes = async (fecha: Date) => {
    if (!user?.id) return

    setIsLoading(true)
    try {
      const fechaStr = format(fecha, "yyyy-MM-dd")
      const { data } = await getFichajesUsuario(user.id, fechaStr)
      setFichajes(data || [])
    } catch (error) {
      console.error("Error cargando fichajes:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user?.id) {
      cargarFichajes(selectedDate)
    }
  }, [user, selectedDate])

  // Escuchar eventos de fichaje para recargar
  useEffect(() => {
    const handleFichajeUpdate = () => {
      cargarFichajes(selectedDate)
    }

    window.addEventListener("fichajeUpdated", handleFichajeUpdate)
    return () => window.removeEventListener("fichajeUpdated", handleFichajeUpdate)
  }, [selectedDate])

  const getTipoFichajeBadge = (fichaje: Fichaje) => {
    const isEntrada = fichaje.tipo_fichaje === "entrada"
    const isPresencia = fichaje.tipo === "presencia"

    return (
      <Badge
        variant={isEntrada ? "default" : "secondary"}
        className={cn(
          isEntrada ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800",
          isPresencia ? "border-blue-200" : "border-gray-200",
        )}
      >
        {isEntrada ? "Entrada" : "Salida"} - {isPresencia ? "Presencia" : "Trabajo"}
      </Badge>
    )
  }

  const calcularTiempoTotal = () => {
    const fichajesPresencia = fichajes.filter((f) => f.tipo === "presencia")
    let tiempoTotal = 0

    for (let i = 0; i < fichajesPresencia.length; i += 2) {
      const entrada = fichajesPresencia.find((f, idx) => idx >= i && f.tipo_fichaje === "entrada")
      const salida = fichajesPresencia.find((f, idx) => idx > i && f.tipo_fichaje === "salida")

      if (entrada && salida) {
        const tiempoEntrada = new Date(entrada.fecha_hora).getTime()
        const tiempoSalida = new Date(salida.fecha_hora).getTime()
        tiempoTotal += tiempoSalida - tiempoEntrada
      }
    }

    const horas = Math.floor(tiempoTotal / (1000 * 60 * 60))
    const minutos = Math.floor((tiempoTotal % (1000 * 60 * 60)) / (1000 * 60))
    return `${horas}h ${minutos}m`
  }

  if (!user) {
    return <div>Cargando...</div>
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Control de Fichajes</h1>
        </div>

        {/* Control de presencia */}
        <FichajePresencia />

        {/* Selector de fecha y resumen */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Seleccionar Fecha
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Tiempo Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{calcularTiempoTotal()}</div>
              <p className="text-sm text-gray-500">Tiempo trabajado en el día</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Total Fichajes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{fichajes.length}</div>
              <p className="text-sm text-gray-500">Fichajes registrados hoy</p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de fichajes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Fichajes del {format(selectedDate, "PPP", { locale: es })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : fichajes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No hay fichajes registrados para esta fecha</p>
              </div>
            ) : (
              <div className="space-y-4">
                {fichajes.map((fichaje) => (
                  <div
                    key={fichaje.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-lg font-mono font-semibold text-gray-900">
                        {new Date(fichaje.fecha_hora).toLocaleTimeString("es-ES", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </div>
                      {getTipoFichajeBadge(fichaje)}
                    </div>
                    <div className="text-right">
                      {fichaje.observaciones && <p className="text-sm text-gray-600">{fichaje.observaciones}</p>}
                      {fichaje.parte_trabajo_id && (
                        <p className="text-xs text-blue-600">Parte: {fichaje.parte_trabajo_id}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
