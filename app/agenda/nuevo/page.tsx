"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { LoginForm } from "@/components/login-form"
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
import { CalendarIcon, Clock, User, Car, FileText, Save, ArrowLeft } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { createCita } from "@/lib/db"

export default function NuevaCitaPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>()

  // Datos del formulario
  const [formData, setFormData] = useState({
    clienteNombre: "",
    clienteTelefono: "",
    clienteEmail: "",
    vehiculoMatricula: "",
    vehiculoMarca: "",
    vehiculoModelo: "",
    tipoServicio: "",
    hora: "",
    descripcion: "",
    observaciones: "",
  })

  const tiposServicio = [
    "Mantenimiento preventivo",
    "Reparación",
    "Revisión técnica",
    "Instalación",
    "Diagnóstico",
    "Emergencia",
    "Otros",
  ]

  const horasDisponibles = [
    "08:00",
    "08:30",
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return
    if (!selectedDate || !formData.hora || !formData.clienteNombre || !formData.tipoServicio) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Crear fecha y hora completa
      const fechaHora = new Date(selectedDate)
      const [horas, minutos] = formData.hora.split(":")
      fechaHora.setHours(Number.parseInt(horas), Number.parseInt(minutos), 0, 0)

      // Preparar datos de la cita
      const citaData = {
        titulo: `${formData.tipoServicio} - ${formData.clienteNombre}`,
        descripcion: formData.descripcion,
        fecha_hora: fechaHora.toISOString(),
        duracion: 60, // 1 hora por defecto
        tipo_servicio: formData.tipoServicio,
        observaciones: JSON.stringify({
          cliente: {
            nombre: formData.clienteNombre,
            telefono: formData.clienteTelefono,
            email: formData.clienteEmail,
          },
          vehiculo: {
            matricula: formData.vehiculoMatricula,
            marca: formData.vehiculoMarca,
            modelo: formData.vehiculoModelo,
          },
          observaciones: formData.observaciones,
        }),
        created_by: user.id,
      }

      const result = await createCita(citaData)

      if (result.success) {
        toast({
          title: "Cita creada",
          description: "La cita ha sido programada correctamente",
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
      setIsSubmitting(false)
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
    return <LoginForm />
  }

  return (
    <MainLayout>
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" onClick={() => router.back()} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Nueva Cita</h1>
            <p className="text-gray-600">Programa una nueva cita con información del cliente</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Información del Cliente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Información del Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="clienteNombre">Nombre del Cliente *</Label>
                  <Input
                    id="clienteNombre"
                    value={formData.clienteNombre}
                    onChange={(e) => handleInputChange("clienteNombre", e.target.value)}
                    placeholder="Nombre completo del cliente"
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
                  />
                </div>
                <div>
                  <Label htmlFor="clienteEmail">Email</Label>
                  <Input
                    id="clienteEmail"
                    type="email"
                    value={formData.clienteEmail}
                    onChange={(e) => handleInputChange("clienteEmail", e.target.value)}
                    placeholder="Correo electrónico"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Información del Vehículo */}
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
                    placeholder="Matrícula del vehículo"
                  />
                </div>
                <div>
                  <Label htmlFor="vehiculoMarca">Marca</Label>
                  <Input
                    id="vehiculoMarca"
                    value={formData.vehiculoMarca}
                    onChange={(e) => handleInputChange("vehiculoMarca", e.target.value)}
                    placeholder="Marca del vehículo"
                  />
                </div>
                <div>
                  <Label htmlFor="vehiculoModelo">Modelo</Label>
                  <Input
                    id="vehiculoModelo"
                    value={formData.vehiculoModelo}
                    onChange={(e) => handleInputChange("vehiculoModelo", e.target.value)}
                    placeholder="Modelo del vehículo"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Programación de la Cita */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Programación de la Cita
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label>Fecha *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label htmlFor="hora">Hora *</Label>
                  <Select value={formData.hora} onValueChange={(value) => handleInputChange("hora", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar hora" />
                    </SelectTrigger>
                    <SelectContent>
                      {horasDisponibles.map((hora) => (
                        <SelectItem key={hora} value={hora}>
                          {hora}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="tipoServicio">Tipo de Servicio *</Label>
                  <Select
                    value={formData.tipoServicio}
                    onValueChange={(value) => handleInputChange("tipoServicio", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar servicio" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposServicio.map((tipo) => (
                        <SelectItem key={tipo} value={tipo}>
                          {tipo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detalles del Trabajo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Detalles del Trabajo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="descripcion">Descripción del Trabajo</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => handleInputChange("descripcion", e.target.value)}
                  placeholder="Describe el trabajo a realizar..."
                  rows={3}
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

          {/* Botones de Acción */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2">
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Crear Cita
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  )
}
