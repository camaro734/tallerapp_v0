"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "@/hooks/use-toast"
import { CalendarIcon, Clock, User, Car, FileText, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { createCita } from "@/lib/db"

export default function NuevaCitaPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    // Información del cliente
    clienteNombre: "",
    clienteTelefono: "",
    clienteEmail: "",

    // Información del vehículo
    vehiculoMatricula: "",
    vehiculoMarca: "",
    vehiculoModelo: "",

    // Programación
    fecha: undefined as Date | undefined,
    hora: "",
    tipoServicio: "",

    // Detalles
    descripcion: "",
    observaciones: "",
  })

  const tiposServicio = [
    "Revisión general",
    "Cambio de aceite",
    "Reparación de frenos",
    "Reparación de motor",
    "Mantenimiento preventivo",
    "Diagnóstico",
    "Reparación de transmisión",
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
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
    "18:30",
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.clienteNombre.trim()) {
      toast({
        title: "Error",
        description: "El nombre del cliente es obligatorio",
        variant: "destructive",
      })
      return
    }

    if (!formData.fecha) {
      toast({
        title: "Error",
        description: "La fecha es obligatoria",
        variant: "destructive",
      })
      return
    }

    if (!formData.hora) {
      toast({
        title: "Error",
        description: "La hora es obligatoria",
        variant: "destructive",
      })
      return
    }

    if (!formData.tipoServicio) {
      toast({
        title: "Error",
        description: "El tipo de servicio es obligatorio",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Crear objeto con información del cliente para almacenar en observaciones
      const clienteInfo = {
        nombre: formData.clienteNombre,
        telefono: formData.clienteTelefono || null,
        email: formData.clienteEmail || null,
        vehiculo: {
          matricula: formData.vehiculoMatricula || null,
          marca: formData.vehiculoMarca || null,
          modelo: formData.vehiculoModelo || null,
        },
      }

      // Combinar fecha y hora
      const fechaHora = new Date(formData.fecha)
      const [horas, minutos] = formData.hora.split(":")
      fechaHora.setHours(Number.parseInt(horas), Number.parseInt(minutos), 0, 0)

      const citaData = {
        fecha_hora: fechaHora.toISOString(),
        tipo_servicio: formData.tipoServicio,
        descripcion: formData.descripcion || null,
        observaciones: JSON.stringify({
          cliente: clienteInfo,
          observaciones_adicionales: formData.observaciones || null,
        }),
        estado: "programada" as const,
      }

      const { error } = await createCita(citaData)

      if (error) {
        throw new Error(error.message || "Error al crear la cita")
      }

      toast({
        title: "Cita creada",
        description: "La cita se ha programado correctamente",
      })

      router.push("/agenda")
    } catch (error) {
      console.error("Error creando cita:", error)
      toast({
        title: "Error",
        description: "No se pudo crear la cita. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Nueva Cita</h1>
        <p className="text-gray-600 mt-1">Programa una nueva cita para un cliente</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información del Cliente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Información del Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clienteNombre">Nombre *</Label>
                <Input
                  id="clienteNombre"
                  value={formData.clienteNombre}
                  onChange={(e) => handleInputChange("clienteNombre", e.target.value)}
                  placeholder="Nombre completo del cliente"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clienteTelefono">Teléfono</Label>
                <Input
                  id="clienteTelefono"
                  value={formData.clienteTelefono}
                  onChange={(e) => handleInputChange("clienteTelefono", e.target.value)}
                  placeholder="Número de teléfono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clienteEmail">Email</Label>
                <Input
                  id="clienteEmail"
                  type="email"
                  value={formData.clienteEmail}
                  onChange={(e) => handleInputChange("clienteEmail", e.target.value)}
                  placeholder="Correo electrónico"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información del Vehículo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5 text-blue-600" />
              Información del Vehículo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehiculoMatricula">Matrícula</Label>
                <Input
                  id="vehiculoMatricula"
                  value={formData.vehiculoMatricula}
                  onChange={(e) => handleInputChange("vehiculoMatricula", e.target.value.toUpperCase())}
                  placeholder="1234ABC"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehiculoMarca">Marca</Label>
                <Input
                  id="vehiculoMarca"
                  value={formData.vehiculoMarca}
                  onChange={(e) => handleInputChange("vehiculoMarca", e.target.value)}
                  placeholder="Toyota, Ford, etc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehiculoModelo">Modelo</Label>
                <Input
                  id="vehiculoModelo"
                  value={formData.vehiculoModelo}
                  onChange={(e) => handleInputChange("vehiculoModelo", e.target.value)}
                  placeholder="Corolla, Focus, etc."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Programación */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Programación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Fecha *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.fecha && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.fecha ? format(formData.fecha, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.fecha}
                      onSelect={(date) => setFormData((prev) => ({ ...prev, fecha: date }))}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
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
              <div className="space-y-2">
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

        {/* Detalles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Detalles del Servicio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción del Trabajo</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => handleInputChange("descripcion", e.target.value)}
                placeholder="Describe el trabajo a realizar..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
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

        {/* Botones */}
        <div className="flex gap-4 justify-end">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando...
              </>
            ) : (
              "Crear Cita"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
