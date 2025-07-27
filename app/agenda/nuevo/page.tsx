"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Clock, User, Car, FileText, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { createCita } from "@/lib/db"

export default function NuevaCitaPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState("")

  // Datos del formulario
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    clienteNombre: "",
    clienteTelefono: "",
    clienteEmail: "",
    vehiculoMatricula: "",
    vehiculoMarca: "",
    vehiculoModelo: "",
    tipoServicio: "",
    duracion: 60,
    observaciones: "",
  })

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user?.id) {
      toast({
        title: "Error",
        description: "Usuario no autenticado",
        variant: "destructive",
      })
      return
    }

    if (!selectedDate || !selectedTime) {
      toast({
        title: "Error",
        description: "Debe seleccionar fecha y hora",
        variant: "destructive",
      })
      return
    }

    if (!formData.titulo || !formData.clienteNombre) {
      toast({
        title: "Error",
        description: "Título y nombre del cliente son obligatorios",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Combinar fecha y hora
      const [hours, minutes] = selectedTime.split(":").map(Number)
      const fechaHora = new Date(selectedDate)
      fechaHora.setHours(hours, minutes, 0, 0)

      const citaData = {
        titulo: formData.titulo,
        descripcion: `Cliente: ${formData.clienteNombre}${formData.clienteTelefono ? ` - Tel: ${formData.clienteTelefono}` : ""}${
          formData.vehiculoMatricula ? ` - Vehículo: ${formData.vehiculoMatricula}` : ""
        }${formData.descripcion ? ` - ${formData.descripcion}` : ""}`,
        fecha_hora: fechaHora.toISOString(),
        duracion: formData.duracion,
        tipo_servicio: formData.tipoServicio || "general",
        observaciones: formData.observaciones,
        created_by: user.id,
      }

      const result = await createCita(citaData)

      if (result.success) {
        toast({
          title: "Cita creada",
          description: "La cita ha sido registrada correctamente",
        })
        router.push("/agenda")
      } else {
        throw new Error(result.error || "Error al crear la cita")
      }
    } catch (error) {
      console.error("Error creando cita:", error)
      toast({
        title: "Error",
        description: "No se pudo crear la cita",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Generar opciones de tiempo (cada 30 minutos)
  const timeOptions = []
  for (let hour = 8; hour < 18; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
      timeOptions.push(timeString)
    }
  }

  if (!user) {
    return <div>Cargando...</div>
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Nueva Cita</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Información básica */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Información de la Cita
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="titulo">Título de la cita *</Label>
                  <Input
                    id="titulo"
                    value={formData.titulo}
                    onChange={(e) => handleInputChange("titulo", e.target.value)}
                    placeholder="Ej: Revisión sistema hidráulico"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    value={formData.descripcion}
                    onChange={(e) => handleInputChange("descripcion", e.target.value)}
                    placeholder="Descripción detallada del servicio..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="tipoServicio">Tipo de Servicio</Label>
                  <Select
                    value={formData.tipoServicio}
                    onValueChange={(value) => handleInputChange("tipoServicio", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                      <SelectItem value="reparacion">Reparación</SelectItem>
                      <SelectItem value="instalacion">Instalación</SelectItem>
                      <SelectItem value="revision">Revisión</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="duracion">Duración estimada (minutos)</Label>
                  <Select
                    value={formData.duracion.toString()}
                    onValueChange={(value) => handleInputChange("duracion", Number.parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutos</SelectItem>
                      <SelectItem value="60">1 hora</SelectItem>
                      <SelectItem value="90">1.5 horas</SelectItem>
                      <SelectItem value="120">2 horas</SelectItem>
                      <SelectItem value="180">3 horas</SelectItem>
                      <SelectItem value="240">4 horas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Fecha y hora */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Fecha y Hora
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Fecha de la cita *</Label>
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
                        onSelect={setSelectedDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        locale={es}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label htmlFor="hora">Hora de la cita *</Label>
                  <Select value={selectedTime} onValueChange={setSelectedTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar hora" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map((time) => (
                        <SelectItem key={time} value={time}>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {time}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Información del cliente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Información del Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="clienteNombre">Nombre del cliente *</Label>
                  <Input
                    id="clienteNombre"
                    value={formData.clienteNombre}
                    onChange={(e) => handleInputChange("clienteNombre", e.target.value)}
                    placeholder="Nombre completo o empresa"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="clienteTelefono">Teléfono</Label>
                  <Input
                    id="clienteTelefono"
                    value={formData.clienteTelefono}
                    onChange={(e) => handleInputChange("clienteTelefono", e.target.value)}
                    placeholder="Número de teléfono"
                    type="tel"
                  />
                </div>

                <div>
                  <Label htmlFor="clienteEmail">Email</Label>
                  <Input
                    id="clienteEmail"
                    value={formData.clienteEmail}
                    onChange={(e) => handleInputChange("clienteEmail", e.target.value)}
                    placeholder="correo@ejemplo.com"
                    type="email"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Información del vehículo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Información del Vehículo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="vehiculoMatricula">Matrícula</Label>
                  <Input
                    id="vehiculoMatricula"
                    value={formData.vehiculoMatricula}
                    onChange={(e) => handleInputChange("vehiculoMatricula", e.target.value)}
                    placeholder="1234ABC"
                  />
                </div>

                <div>
                  <Label htmlFor="vehiculoMarca">Marca</Label>
                  <Input
                    id="vehiculoMarca"
                    value={formData.vehiculoMarca}
                    onChange={(e) => handleInputChange("vehiculoMarca", e.target.value)}
                    placeholder="Mercedes, Volvo, Scania..."
                  />
                </div>

                <div>
                  <Label htmlFor="vehiculoModelo">Modelo</Label>
                  <Input
                    id="vehiculoModelo"
                    value={formData.vehiculoModelo}
                    onChange={(e) => handleInputChange("vehiculoModelo", e.target.value)}
                    placeholder="Actros, FH, R450..."
                  />
                </div>

                <div>
                  <Label htmlFor="observaciones">Observaciones</Label>
                  <Textarea
                    id="observaciones"
                    value={formData.observaciones}
                    onChange={(e) => handleInputChange("observaciones", e.target.value)}
                    placeholder="Observaciones adicionales..."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creando..." : "Crear Cita"}
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  )
}
