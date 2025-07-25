"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Plus, ChevronLeft, ChevronRight, Clock, User, Car } from "lucide-react"
import {
  format,
  addDays,
  addWeeks,
  addMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  isToday,
} from "date-fns"
import { es } from "date-fns/locale"
import { MainLayout } from "@/components/main-layout"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { canCreateAppointments } from "@/lib/database"

// Tipo para las citas
interface Cita {
  id: string
  cliente_nombre: string
  vehiculo_matricula?: string
  fecha_hora: string
  duracion_estimada: number
  tipo_servicio: string
  descripcion?: string
  estado: "programada" | "en_curso" | "completada" | "cancelada"
}

// Datos de ejemplo para las citas
const citasEjemplo: Cita[] = [
  {
    id: "1",
    cliente_nombre: "Transportes García S.L.",
    vehiculo_matricula: "1234ABC",
    fecha_hora: new Date().toISOString(),
    duracion_estimada: 120,
    tipo_servicio: "Revisión",
    descripcion: "Revisión sistema hidráulico",
    estado: "programada",
  },
  {
    id: "2",
    cliente_nombre: "Logística Martínez",
    vehiculo_matricula: "5678DEF",
    fecha_hora: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // +2 horas
    duracion_estimada: 90,
    tipo_servicio: "Reparación",
    descripcion: "Reparación plataforma elevadora",
    estado: "programada",
  },
  {
    id: "3",
    cliente_nombre: "Construcciones López",
    vehiculo_matricula: "9012GHI",
    fecha_hora: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // +1 día
    duracion_estimada: 180,
    tipo_servicio: "Instalación",
    descripcion: "Instalación nueva plataforma",
    estado: "programada",
  },
]

type VistaAgenda = "dia" | "semana" | "mes"

export default function AgendaPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [vista, setVista] = useState<VistaAgenda>("semana")
  const [fechaActual, setFechaActual] = useState(new Date())
  const [citas, setCitas] = useState<Cita[]>(citasEjemplo)

  const puedeCrearCitas = canCreateAppointments(user?.rol)

  // Funciones de navegación
  const navegarAnterior = () => {
    switch (vista) {
      case "dia":
        setFechaActual((prev) => addDays(prev, -1))
        break
      case "semana":
        setFechaActual((prev) => addWeeks(prev, -1))
        break
      case "mes":
        setFechaActual((prev) => addMonths(prev, -1))
        break
    }
  }

  const navegarSiguiente = () => {
    switch (vista) {
      case "dia":
        setFechaActual((prev) => addDays(prev, 1))
        break
      case "semana":
        setFechaActual((prev) => addWeeks(prev, 1))
        break
      case "mes":
        setFechaActual((prev) => addMonths(prev, 1))
        break
    }
  }

  const irHoy = () => {
    setFechaActual(new Date())
  }

  // Obtener título según la vista
  const obtenerTitulo = () => {
    switch (vista) {
      case "dia":
        return format(fechaActual, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })
      case "semana":
        const inicioSemana = startOfWeek(fechaActual, { weekStartsOn: 1 })
        const finSemana = endOfWeek(fechaActual, { weekStartsOn: 1 })
        return `${format(inicioSemana, "d MMM", { locale: es })} - ${format(finSemana, "d MMM yyyy", { locale: es })}`
      case "mes":
        return format(fechaActual, "MMMM yyyy", { locale: es })
      default:
        return ""
    }
  }

  // Filtrar citas por fecha
  const obtenerCitasPorFecha = (fecha: Date) => {
    return citas.filter((cita) => isSameDay(new Date(cita.fecha_hora), fecha))
  }

  // Obtener color del badge según el estado
  const obtenerColorEstado = (estado: string) => {
    switch (estado) {
      case "programada":
        return "bg-blue-100 text-blue-800"
      case "en_curso":
        return "bg-yellow-100 text-yellow-800"
      case "completada":
        return "bg-green-100 text-green-800"
      case "cancelada":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Renderizar vista de día
  const renderVistaDia = () => {
    const citasDelDia = obtenerCitasPorFecha(fechaActual)

    return (
      <div className="space-y-4">
        {citasDelDia.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No hay citas programadas para este día</p>
            </CardContent>
          </Card>
        ) : (
          citasDelDia.map((cita) => (
            <Card key={cita.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{format(new Date(cita.fecha_hora), "HH:mm", { locale: es })}</span>
                      <span className="text-sm text-gray-500">({cita.duracion_estimada} min)</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{cita.cliente_nombre}</span>
                    </div>
                    {cita.vehiculo_matricula && (
                      <div className="flex items-center gap-2 mb-2">
                        <Car className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{cita.vehiculo_matricula}</span>
                      </div>
                    )}
                    <p className="text-sm text-gray-600 mb-2">{cita.descripcion}</p>
                    <Badge variant="secondary" className="text-xs">
                      {cita.tipo_servicio}
                    </Badge>
                  </div>
                  <Badge className={`${obtenerColorEstado(cita.estado)} border-0`}>{cita.estado}</Badge>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    )
  }

  // Renderizar vista de semana
  const renderVistaSemana = () => {
    const inicioSemana = startOfWeek(fechaActual, { weekStartsOn: 1 })
    const diasSemana = eachDayOfInterval({
      start: inicioSemana,
      end: endOfWeek(fechaActual, { weekStartsOn: 1 }),
    })

    return (
      <div className="grid grid-cols-7 gap-4">
        {diasSemana.map((dia) => {
          const citasDelDia = obtenerCitasPorFecha(dia)
          const esHoy = isToday(dia)

          return (
            <Card key={dia.toISOString()} className={`${esHoy ? "ring-2 ring-blue-500" : ""}`}>
              <CardHeader className="pb-2">
                <CardTitle className={`text-sm ${esHoy ? "text-blue-600" : ""}`}>
                  {format(dia, "EEE d", { locale: es })}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 space-y-1">
                {citasDelDia.slice(0, 3).map((cita) => (
                  <div key={cita.id} className="text-xs p-2 bg-blue-50 rounded border-l-2 border-blue-400">
                    <div className="font-medium truncate">
                      {format(new Date(cita.fecha_hora), "HH:mm")} - {cita.cliente_nombre}
                    </div>
                    <div className="text-gray-600 truncate">{cita.tipo_servicio}</div>
                  </div>
                ))}
                {citasDelDia.length > 3 && (
                  <div className="text-xs text-gray-500 text-center py-1">+{citasDelDia.length - 3} más</div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  // Renderizar vista de mes
  const renderVistaMes = () => {
    const inicioMes = startOfMonth(fechaActual)
    const finMes = endOfMonth(fechaActual)
    const inicioCalendario = startOfWeek(inicioMes, { weekStartsOn: 1 })
    const finCalendario = endOfWeek(finMes, { weekStartsOn: 1 })

    const diasCalendario = eachDayOfInterval({
      start: inicioCalendario,
      end: finCalendario,
    })

    const diasSemana = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

    return (
      <div className="space-y-4">
        {/* Encabezados de días */}
        <div className="grid grid-cols-7 gap-2">
          {diasSemana.map((dia) => (
            <div key={dia} className="text-center text-sm font-medium text-gray-500 py-2">
              {dia}
            </div>
          ))}
        </div>

        {/* Calendario */}
        <div className="grid grid-cols-7 gap-2">
          {diasCalendario.map((dia) => {
            const citasDelDia = obtenerCitasPorFecha(dia)
            const esHoy = isToday(dia)
            const esMesActual = isSameMonth(dia, fechaActual)

            return (
              <Card
                key={dia.toISOString()}
                className={`min-h-[100px] ${esHoy ? "ring-2 ring-blue-500" : ""} ${!esMesActual ? "opacity-50" : ""}`}
              >
                <CardContent className="p-2">
                  <div className={`text-sm font-medium mb-1 ${esHoy ? "text-blue-600" : ""}`}>{format(dia, "d")}</div>
                  <div className="space-y-1">
                    {citasDelDia.slice(0, 2).map((cita) => (
                      <div
                        key={cita.id}
                        className="text-xs p-1 bg-blue-50 rounded truncate"
                        title={`${format(new Date(cita.fecha_hora), "HH:mm")} - ${cita.cliente_nombre}`}
                      >
                        {format(new Date(cita.fecha_hora), "HH:mm")} {cita.cliente_nombre}
                      </div>
                    ))}
                    {citasDelDia.length > 2 && (
                      <div className="text-xs text-gray-500 text-center">+{citasDelDia.length - 2}</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <MainLayout>
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Agenda</h1>
            <p className="text-gray-600">Gestión de citas y programación</p>
          </div>
          {puedeCrearCitas && (
            <Button onClick={() => router.push("/agenda/nuevo")} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Cita
            </Button>
          )}
        </div>

        {/* Controles de vista */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              {/* Selector de vista */}
              <div className="flex gap-2">
                <Button variant={vista === "dia" ? "default" : "outline"} size="sm" onClick={() => setVista("dia")}>
                  Día
                </Button>
                <Button
                  variant={vista === "semana" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setVista("semana")}
                >
                  Semana
                </Button>
                <Button variant={vista === "mes" ? "default" : "outline"} size="sm" onClick={() => setVista("mes")}>
                  Mes
                </Button>
              </div>

              {/* Navegación */}
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" onClick={navegarAnterior}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="text-lg font-semibold min-w-[200px] text-center">{obtenerTitulo()}</div>

                <Button variant="outline" size="sm" onClick={navegarSiguiente}>
                  <ChevronRight className="h-4 w-4" />
                </Button>

                <Button variant="outline" size="sm" onClick={irHoy}>
                  Hoy
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contenido de la vista */}
        <div>
          {vista === "dia" && renderVistaDia()}
          {vista === "semana" && renderVistaSemana()}
          {vista === "mes" && renderVistaMes()}
        </div>
      </div>
    </MainLayout>
  )
}
