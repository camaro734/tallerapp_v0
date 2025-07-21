"use client"
import { useState, useEffect } from "react"
import { MainLayout } from "@/components/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Plus, Clock, Truck } from "lucide-react"
import Link from "next/link"
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addDays,
  subDays,
  isSameDay,
  isToday,
  parseISO,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  isSameMonth,
} from "date-fns"
import { es } from "date-fns/locale"
import { type Cita, getCitas, updateCita, deleteCita } from "@/lib/db"
import { cn } from "@/lib/utils"
import { CitaModal } from "@/components/cita-modal"
import { useToast } from "@/components/ui/use-toast"

type View = "mes" | "semana" | "dia"

export default function AgendaPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<View>("mes")
  const [citas, setCitas] = useState<Cita[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCita, setSelectedCita] = useState<Cita | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      const { data: citasData } = await getCitas()
      if (citasData) setCitas(citasData)
    }
    fetchData()
  }, [])

  const handlePrev = () => {
    if (view === "mes") setCurrentDate(subMonths(currentDate, 1))
    else if (view === "semana") setCurrentDate(subDays(currentDate, 7))
    else setCurrentDate(subDays(currentDate, 1))
  }

  const handleNext = () => {
    if (view === "mes") setCurrentDate(addMonths(currentDate, 1))
    else if (view === "semana") setCurrentDate(addDays(currentDate, 7))
    else setCurrentDate(addDays(currentDate, 1))
  }

  const handleToday = () => setCurrentDate(new Date())

  const handleCitaClick = (cita: Cita) => {
    setSelectedCita(cita)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedCita(null)
  }

  const handleSaveCita = async (citaId: string, updates: Partial<Cita>) => {
    const { data: updatedCita, error } = await updateCita(citaId, updates)
    if (updatedCita) {
      setCitas((prev) => prev.map((c) => (c.id === citaId ? { ...c, ...updatedCita } : c)))
      toast({ title: "Éxito", description: "Cita actualizada correctamente." })
      handleCloseModal()
    } else {
      toast({ title: "Error", description: error?.message || "No se pudo actualizar la cita.", variant: "destructive" })
    }
  }

  const handleDeleteCita = async (citaId: string) => {
    const { error } = await deleteCita(citaId)
    if (!error) {
      setCitas((prev) => prev.filter((c) => c.id !== citaId))
      toast({ title: "Éxito", description: "Cita eliminada correctamente." })
      handleCloseModal()
    } else {
      toast({ title: "Error", description: error?.message || "No se pudo eliminar la cita.", variant: "destructive" })
    }
  }

  const getCitasForDay = (day: Date) => {
    return citas
      .filter((cita) => isSameDay(parseISO(cita.fecha_hora), day))
      .sort((a, b) => parseISO(a.fecha_hora).getTime() - parseISO(b.fecha_hora).getTime())
  }

  const Header = () => {
    const formatTitle = () => {
      if (view === "mes") return format(currentDate, "LLLL yyyy", { locale: es })
      if (view === "semana") {
        const start = startOfWeek(currentDate, { locale: es })
        const end = endOfWeek(currentDate, { locale: es })
        return `${format(start, "d LLL", { locale: es })} - ${format(end, "d LLL, yyyy", { locale: es })}`
      }
      return format(currentDate, "eeee, d 'de' LLLL", { locale: es })
    }

    return (
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePrev}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" onClick={handleToday}>
            Hoy
          </Button>
          <h2 className="text-xl font-semibold text-gray-800 capitalize">{formatTitle()}</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center rounded-md bg-gray-100 p-1">
            {(["mes", "semana", "dia"] as View[]).map((v) => (
              <Button
                key={v}
                variant={view === v ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setView(v)}
                className="capitalize"
              >
                {v}
              </Button>
            ))}
          </div>
          <Link href="/agenda/nuevo">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Cita
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const MonthView = () => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const startDate = startOfWeek(monthStart, { locale: es })
    const endDate = endOfWeek(monthEnd, { locale: es })
    const days = eachDayOfInterval({ start: startDate, end: endDate })

    return (
      <div className="grid grid-cols-7">
        {["lun", "mar", "mié", "jue", "vie", "sáb", "dom"].map((day) => (
          <div key={day} className="p-2 text-center text-xs font-bold uppercase text-gray-500 border-b">
            {day}
          </div>
        ))}
        {days.map((day) => (
          <div
            key={day.toString()}
            className={cn(
              "border-r border-b p-2 min-h-[120px]",
              !isSameMonth(day, currentDate) && "bg-gray-50 text-gray-400",
              isToday(day) && "bg-blue-50",
            )}
          >
            <p className={cn("font-semibold", isToday(day) && "text-blue-600")}>{format(day, "d")}</p>
            <div className="mt-1 space-y-1">
              {getCitasForDay(day).map((cita) => (
                <div
                  key={cita.id}
                  onClick={() => handleCitaClick(cita)}
                  className="bg-blue-100 text-blue-800 p-1 rounded-md text-xs truncate cursor-pointer hover:bg-blue-200"
                >
                  {format(parseISO(cita.fecha_hora), "HH:mm")} {cita.cliente_nombre || cita.cliente?.nombre}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const WeekView = () => {
    const week = eachDayOfInterval({
      start: startOfWeek(currentDate, { locale: es }),
      end: endOfWeek(currentDate, { locale: es }),
    })
    return (
      <div className="grid grid-cols-7 border-l border-t">
        {week.map((day) => (
          <div key={day.toString()} className="border-r border-b min-h-[600px]">
            <div className={cn("p-2 text-center border-b", isToday(day) && "bg-blue-50")}>
              <p className="text-sm capitalize text-gray-500">{format(day, "eee", { locale: es })}</p>
              <p className={cn("text-2xl font-semibold", isToday(day) && "text-blue-600")}>{format(day, "d")}</p>
            </div>
            <div className="p-2 space-y-2">
              {getCitasForDay(day).map((cita) => (
                <Card
                  key={cita.id}
                  onClick={() => handleCitaClick(cita)}
                  className="bg-blue-50 border-blue-200 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <CardContent className="p-2 text-xs">
                    <p className="font-bold text-blue-800">{format(parseISO(cita.fecha_hora), "HH:mm")}</p>
                    <p className="truncate">{cita.cliente_nombre || cita.cliente?.nombre}</p>
                    <p className="text-gray-600 truncate">{cita.tipo_servicio}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const DayView = () => {
    const hours = Array.from({ length: 12 }, (_, i) => i + 8) // 8 AM to 7 PM
    return (
      <div className="border-t">
        {hours.map((hour) => (
          <div key={hour} className="flex border-b min-h-[80px]">
            <div className="w-20 text-center p-2 border-r">
              <span className="text-sm text-gray-500">{`${hour}:00`}</span>
            </div>
            <div className="flex-1 p-2 space-y-2">
              {getCitasForDay(currentDate)
                .filter((cita) => parseISO(cita.fecha_hora).getHours() === hour)
                .map((cita) => (
                  <Card
                    key={cita.id}
                    onClick={() => handleCitaClick(cita)}
                    className="bg-green-50 border-green-200 cursor-pointer"
                  >
                    <CardContent className="p-3 flex items-start gap-4">
                      <div className="font-semibold text-green-800">{format(parseISO(cita.fecha_hora), "HH:mm")}</div>
                      <div className="flex-1">
                        <p className="font-bold text-base">{cita.cliente_nombre || cita.cliente?.nombre}</p>
                        <p className="text-sm text-gray-700">{cita.tipo_servicio}</p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {cita.duracion_estimada} min
                          </div>
                          {cita.vehiculo && (
                            <div className="flex items-center gap-1">
                              <Truck className="h-3 w-3" />
                              {cita.vehiculo.matricula}
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline">{cita.estado}</Badge>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Agenda</h1>
            <p className="text-gray-600">Gestión de citas y trabajos programados</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-4">
            <Header />
            {view === "mes" && <MonthView />}
            {view === "semana" && <WeekView />}
            {view === "dia" && <DayView />}
          </CardContent>
        </Card>
      </div>
      {selectedCita && (
        <CitaModal
          cita={selectedCita}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveCita}
          onDelete={handleDeleteCita}
        />
      )}
    </MainLayout>
  )
}
