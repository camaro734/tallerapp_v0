"use client"

import { useAuth } from "@/components/auth-provider"
import { MainLayout } from "@/components/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format, addDays, isWeekend } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Check, Clock, FileText, X } from "lucide-react"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { vacaciones, usuarios, createVacacion, updateVacacion } from "@/lib/database"

// Define the form schema
const formSchema = z.object({
  fecha_inicio: z.date({
    required_error: "La fecha de inicio es requerida.",
  }),
  fecha_fin: z.date({
    required_error: "La fecha de fin es requerida.",
  }),
  tipo: z.enum(["vacaciones", "permiso", "baja"], {
    required_error: "El tipo es requerido.",
  }),
  motivo: z.string().optional(),
})

export default function VacacionesPage() {
  const { user, isLoading } = useAuth()
  const [solicitudes, setSolicitudes] = useState(vacaciones)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [diasHabiles, setDiasHabiles] = useState(0)

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fecha_inicio: new Date(),
      fecha_fin: new Date(),
      tipo: "vacaciones",
      motivo: "",
    },
  })

  // Watch for date changes to calculate business days
  const fechaInicio = form.watch("fecha_inicio")
  const fechaFin = form.watch("fecha_fin")

  useEffect(() => {
    if (fechaInicio && fechaFin) {
      // Calculate business days (excluding weekends)
      let days = 0
      let currentDate = new Date(fechaInicio)

      while (currentDate <= fechaFin) {
        if (!isWeekend(currentDate)) {
          days++
        }
        currentDate = addDays(currentDate, 1)
      }

      setDiasHabiles(days)
    }
  }, [fechaInicio, fechaFin])

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return

    try {
      const nuevaSolicitud = await createVacacion({
        user_id: user.id,
        fecha_inicio: format(values.fecha_inicio, "yyyy-MM-dd"),
        fecha_fin: format(values.fecha_fin, "yyyy-MM-dd"),
        dias_solicitados: diasHabiles,
        tipo: values.tipo,
        estado: "pendiente",
        motivo: values.motivo,
      })

      // Update the local state
      setSolicitudes([...solicitudes, nuevaSolicitud])
      setDialogOpen(false)
      form.reset()
    } catch (error) {
      console.error("Error al crear solicitud:", error)
    }
  }

  // Handle approval/rejection
  const handleStatusChange = async (id: string, newStatus: "aprobada" | "rechazada") => {
    if (!user) return

    try {
      await updateVacacion(id, {
        estado: newStatus,
        aprobada_por: user.id,
        fecha_aprobacion: new Date().toISOString(),
      })

      // Update the local state
      setSolicitudes(
        solicitudes.map((solicitud) =>
          solicitud.id === id
            ? {
                ...solicitud,
                estado: newStatus,
                aprobada_por: user.id,
                fecha_aprobacion: new Date().toISOString(),
              }
            : solicitud,
        ),
      )
    } catch (error) {
      console.error("Error al actualizar solicitud:", error)
    }
  }

  // Filter solicitudes by user role
  const misSolicitudes = solicitudes.filter((s) => s.user_id === user?.id)
  const solicitudesPendientes = solicitudes.filter((s) => s.estado === "pendiente")
  const solicitudesAprobadas = solicitudes.filter((s) => s.estado === "aprobada")

  // Helper to get user name
  const getUserName = (userId: string) => {
    const usuario = usuarios.find((u) => u.id === userId)
    return usuario ? `${usuario.nombre} ${usuario.apellidos}` : "Usuario desconocido"
  }

  // Helper to get badge color
  const getBadgeVariant = (estado: string) => {
    switch (estado) {
      case "aprobada":
        return "success"
      case "rechazada":
        return "destructive"
      default:
        return "outline"
    }
  }

  // Helper to get badge text
  const getBadgeText = (estado: string) => {
    switch (estado) {
      case "aprobada":
        return "Aprobada"
      case "rechazada":
        return "Rechazada"
      default:
        return "Pendiente"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Acceso Denegado</h1>
          <p>Debe iniciar sesión para acceder a esta página.</p>
        </div>
      </div>
    )
  }

  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Gestión de Vacaciones y Permisos</h1>
            <p className="text-gray-600">Solicita y gestiona vacaciones, permisos y bajas</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>Nueva Solicitud</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Nueva Solicitud</DialogTitle>
                <DialogDescription>Completa el formulario para solicitar vacaciones o permisos.</DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fecha_inicio"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Fecha Inicio</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP", { locale: es })
                                  ) : (
                                    <span>Selecciona una fecha</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="fecha_fin"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Fecha Fin</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP", { locale: es })
                                  ) : (
                                    <span>Selecciona una fecha</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                                  (fechaInicio && date < fechaInicio)
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm font-medium">
                      Días hábiles solicitados: <span className="font-bold">{diasHabiles}</span>
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="tipo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Solicitud</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="vacaciones">Vacaciones</SelectItem>
                            <SelectItem value="permiso">Permiso</SelectItem>
                            <SelectItem value="baja">Baja</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="motivo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Motivo (opcional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe el motivo de tu solicitud" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button type="submit">Enviar Solicitud</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="mis-solicitudes">
          <TabsList className="mb-4">
            <TabsTrigger value="mis-solicitudes">Mis Solicitudes</TabsTrigger>
            {user.rol === "admin" || user.rol === "jefe_taller" ? (
              <>
                <TabsTrigger value="pendientes">Pendientes de Aprobación</TabsTrigger>
                <TabsTrigger value="historial">Historial</TabsTrigger>
                <TabsTrigger value="calendario">Calendario</TabsTrigger>
              </>
            ) : null}
          </TabsList>

          <TabsContent value="mis-solicitudes">
            <Card>
              <CardHeader>
                <CardTitle>Mis Solicitudes</CardTitle>
                <CardDescription>Historial de tus solicitudes de vacaciones y permisos</CardDescription>
              </CardHeader>
              <CardContent>
                {misSolicitudes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="mx-auto h-12 w-12 opacity-30 mb-2" />
                    <p>No tienes solicitudes registradas</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {misSolicitudes.map((solicitud) => (
                      <div
                        key={solicitud.id}
                        className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              variant={
                                solicitud.tipo === "vacaciones"
                                  ? "default"
                                  : solicitud.tipo === "permiso"
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {solicitud.tipo === "vacaciones"
                                ? "Vacaciones"
                                : solicitud.tipo === "permiso"
                                  ? "Permiso"
                                  : "Baja"}
                            </Badge>
                            <Badge variant={getBadgeVariant(solicitud.estado) as any}>
                              {getBadgeText(solicitud.estado)}
                            </Badge>
                          </div>
                          <p className="font-medium">
                            {format(new Date(solicitud.fecha_inicio), "dd/MM/yyyy")} -{" "}
                            {format(new Date(solicitud.fecha_fin), "dd/MM/yyyy")}
                          </p>
                          <p className="text-sm text-gray-600">{solicitud.dias_solicitados} días hábiles solicitados</p>
                          {solicitud.motivo && <p className="text-sm mt-1">{solicitud.motivo}</p>}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>Solicitado el {format(new Date(solicitud.created_at), "dd/MM/yyyy HH:mm")}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {(user.rol === "admin" || user.rol === "jefe_taller") && (
            <>
              <TabsContent value="pendientes">
                <Card>
                  <CardHeader>
                    <CardTitle>Solicitudes Pendientes</CardTitle>
                    <CardDescription>Solicitudes que requieren tu aprobación</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {solicitudesPendientes.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Check className="mx-auto h-12 w-12 opacity-30 mb-2" />
                        <p>No hay solicitudes pendientes de aprobación</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {solicitudesPendientes.map((solicitud) => (
                          <div
                            key={solicitud.id}
                            className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                          >
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Badge
                                  variant={
                                    solicitud.tipo === "vacaciones"
                                      ? "default"
                                      : solicitud.tipo === "permiso"
                                        ? "secondary"
                                        : "destructive"
                                  }
                                >
                                  {solicitud.tipo === "vacaciones"
                                    ? "Vacaciones"
                                    : solicitud.tipo === "permiso"
                                      ? "Permiso"
                                      : "Baja"}
                                </Badge>
                                <span className="text-sm font-medium">{getUserName(solicitud.user_id)}</span>
                              </div>
                              <p className="font-medium">
                                {format(new Date(solicitud.fecha_inicio), "dd/MM/yyyy")} -{" "}
                                {format(new Date(solicitud.fecha_fin), "dd/MM/yyyy")}
                              </p>
                              <p className="text-sm text-gray-600">
                                {solicitud.dias_solicitados} días hábiles solicitados
                              </p>
                              {solicitud.motivo && <p className="text-sm mt-1">{solicitud.motivo}</p>}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-green-500 text-green-600 hover:bg-green-50 bg-transparent"
                                onClick={() => handleStatusChange(solicitud.id, "aprobada")}
                              >
                                <Check className="mr-1 h-4 w-4" /> Aprobar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-red-500 text-red-600 hover:bg-red-50 bg-transparent"
                                onClick={() => handleStatusChange(solicitud.id, "rechazada")}
                              >
                                <X className="mr-1 h-4 w-4" /> Rechazar
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="historial">
                <Card>
                  <CardHeader>
                    <CardTitle>Historial de Solicitudes</CardTitle>
                    <CardDescription>Todas las solicitudes aprobadas y rechazadas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {solicitudesAprobadas.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="mx-auto h-12 w-12 opacity-30 mb-2" />
                        <p>No hay solicitudes en el historial</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {solicitudesAprobadas.map((solicitud) => (
                          <div
                            key={solicitud.id}
                            className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                          >
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Badge
                                  variant={
                                    solicitud.tipo === "vacaciones"
                                      ? "default"
                                      : solicitud.tipo === "permiso"
                                        ? "secondary"
                                        : "destructive"
                                  }
                                >
                                  {solicitud.tipo === "vacaciones"
                                    ? "Vacaciones"
                                    : solicitud.tipo === "permiso"
                                      ? "Permiso"
                                      : "Baja"}
                                </Badge>
                                <Badge variant={getBadgeVariant(solicitud.estado) as any}>
                                  {getBadgeText(solicitud.estado)}
                                </Badge>
                                <span className="text-sm font-medium">{getUserName(solicitud.user_id)}</span>
                              </div>
                              <p className="font-medium">
                                {format(new Date(solicitud.fecha_inicio), "dd/MM/yyyy")} -{" "}
                                {format(new Date(solicitud.fecha_fin), "dd/MM/yyyy")}
                              </p>
                              <p className="text-sm text-gray-600">
                                {solicitud.dias_solicitados} días hábiles solicitados
                              </p>
                              {solicitud.motivo && <p className="text-sm mt-1">{solicitud.motivo}</p>}
                            </div>
                            <div className="text-sm text-gray-500">
                              {solicitud.aprobada_por && (
                                <p>
                                  {solicitud.estado === "aprobada" ? "Aprobada" : "Rechazada"} por{" "}
                                  {getUserName(solicitud.aprobada_por)}
                                </p>
                              )}
                              {solicitud.fecha_aprobacion && (
                                <p>{format(new Date(solicitud.fecha_aprobacion), "dd/MM/yyyy HH:mm")}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="calendario">
                <Card>
                  <CardHeader>
                    <CardTitle>Calendario de Ausencias</CardTitle>
                    <CardDescription>Vista general de las ausencias programadas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        className="rounded-md border"
                      />

                      <div className="mt-6 w-full">
                        <h3 className="font-medium mb-2">
                          Ausencias para {selectedDate ? format(selectedDate, "PPP", { locale: es }) : "hoy"}:
                        </h3>
                        {selectedDate &&
                        solicitudesAprobadas.some(
                          (s) => new Date(s.fecha_inicio) <= selectedDate && new Date(s.fecha_fin) >= selectedDate,
                        ) ? (
                          <div className="space-y-2">
                            {solicitudesAprobadas
                              .filter(
                                (s) =>
                                  new Date(s.fecha_inicio) <= selectedDate && new Date(s.fecha_fin) >= selectedDate,
                              )
                              .map((solicitud) => (
                                <div key={solicitud.id} className="p-3 bg-gray-50 rounded-md">
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      variant={
                                        solicitud.tipo === "vacaciones"
                                          ? "default"
                                          : solicitud.tipo === "permiso"
                                            ? "secondary"
                                            : "destructive"
                                      }
                                    >
                                      {solicitud.tipo === "vacaciones"
                                        ? "Vacaciones"
                                        : solicitud.tipo === "permiso"
                                          ? "Permiso"
                                          : "Baja"}
                                    </Badge>
                                    <span className="font-medium">{getUserName(solicitud.user_id)}</span>
                                  </div>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {format(new Date(solicitud.fecha_inicio), "dd/MM/yyyy")} -{" "}
                                    {format(new Date(solicitud.fecha_fin), "dd/MM/yyyy")}
                                  </p>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-center py-4">No hay ausencias programadas para este día</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </MainLayout>
  )
}
