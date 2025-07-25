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
import { cn } from "@/lib/utils"
import { createCita } from "@/lib/db"

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

export default function NuevaCitaPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [guardando, setGuardando] = useState(false)
  const [fecha, setFecha] = useState<Date>()

  // Datos del cliente
  const [nombreCliente, setNombreCliente] = useState("")
  const [telefonoCliente, setTelefonoCliente] = useState("")
  const [emailCliente, setEmailCliente] = useState("")

  // Datos del vehículo
  const [matricula, setMatricula] = useState("")
  const [marca, setMarca] = useState("")
  const [modelo, setModelo] = useState("")

  // Datos de la cita
  const [hora, setHora] = useState("")
  const [tipoServicio, setTipoServicio] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [observaciones, setObservaciones] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    // Validaciones básicas
    if (!nombreCliente.trim()) {
      toast({
        title: "Error",
        description: "El nombre del cliente es obligatorio",
        variant: "destructive",
      })
      return
    }

    if (!fecha) {
      toast({
        title: "Error",
        description: "La fecha es obligatoria",
        variant: "destructive",
      })
      return
    }

    if (!hora) {
      toast({
        title: "Error",
        description: "La hora es obligatoria",
        variant: "destructive",
      })
      return
    }

    if (!tipoServicio) {
      toast({
        title: "Error",
        description: "El tipo de servicio es obligatorio",
        variant: "destructive",
      })
      return
    }

    setGuardando(true)

    try {
      // Crear objeto con información del cliente
      const infoCliente = {
        nombre: nombreCliente.trim(),
        telefono: telefonoCliente.trim() || null,
        email: emailCliente.trim() || null,
        vehiculo: {
          matricula: matricula.trim() || null,
          marca: marca.trim() || null,
          modelo: modelo.trim() || null,
        },
      }

      // Combinar fecha y hora
      const [horas, minutos] = hora.split(":").map(Number)
      const fechaHora = new Date(fecha)
      fechaHora.setHours(horas, minutos, 0, 0)

      // Crear la cita
      const { data, error } = await createCita({
        cliente_id: null, // No usamos cliente_id ya que guardamos la info en observaciones
        fecha_hora: fechaHora.toISOString(),
        tipo_servicio: tipoServicio,
        descripcion: descripcion.trim() || null,
        observaciones: JSON.stringify({
          cliente: infoCliente,
          observaciones_adicionales: observaciones.trim() || null,
        }),
        estado: "programada",
        tecnico_asignado_id: user.id,
      })

      if (error) {
        throw new Error(error.message || "Error al crear la cita")
      }

      toast({
        title: "Cita creada",
        description: `Cita programada para ${format(fechaHora, "dd/MM/yyyy 'a las' HH:mm", { locale: es })}`,
      })

      // Redirigir a la agenda
      router.push("/agenda")
    } catch (error) {
      console.error("Error creando cita:", error)
      toast({
        title: "Error",
        description: "No se pudo crear la cita. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setGuardando(false)
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
      <div className="p-4 md:p-6">
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Nueva Cita</h1>
          <p className="text-gray-600">Programa una nueva cita con información del cliente</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información del Cliente */}
          <Card className="industrial-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información del Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombreCliente">
                    Nombre del Cliente <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nombreCliente"
                    value={nombreCliente}
                    onChange={(e) => setNombreCliente(e.target.value)}
                    placeholder="Nombre completo del cliente"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefonoCliente">Teléfono</Label>
                  <Input
                    id="telefonoCliente"
                    value={telefonoCliente}
                    onChange={(e) => setTelefonoCliente(e.target.value)}
                    placeholder="Número de teléfono"
                    type="tel"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="emailCliente">Email</Label>
                <Input
                  id="emailCliente"
                  value={emailCliente}
                  onChange={(e) => setEmailCliente(e.target.value)}
                  placeholder="Correo electrónico"
                  type="email"
                />
              </div>
            </CardContent>
          </Card>

          {/* Información del Vehículo */}
          <Card className="industrial-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Información del Vehículo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="matricula">Matrícula</Label>
                  <Input
                    id="matricula"
                    value={matricula}
                    onChange={(e) => setMatricula(e.target.value.toUpperCase())}
                    placeholder="1234ABC"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="marca">Marca</Label>
                  <Input
                    id="marca"
                    value={marca}
                    onChange={(e) => setMarca(e.target.value)}
                    placeholder="Toyota, Ford, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="modelo">Modelo</Label>
                  <Input
                    id="modelo"
                    value={modelo}
                    onChange={(e) => setModelo(e.target.value)}
                    placeholder="Corolla, Focus, etc."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Programación de la Cita */}
          <Card className="industrial-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Programación de la Cita
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    Fecha <span className="text-red-500">*</span>
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("w-full justify-start text-left font-normal", !fecha && "text-muted-foreground")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {fecha ? format(fecha, "PPP", { locale: es }) : "Seleccionar fecha"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={fecha}
                        onSelect={setFecha}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hora">
                    Hora <span className="text-red-500">*</span>
                  </Label>
                  <Select value={hora} onValueChange={setHora} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar hora" />
                    </SelectTrigger>
                    <SelectContent>
                      {horasDisponibles.map((h) => (
                        <SelectItem key={h} value={h}>
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipoServicio">
                  Tipo de Servicio <span className="text-red-500">*</span>
                </Label>
                <Select value={tipoServicio} onValueChange={setTipoServicio} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo de servicio" />
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
            </CardContent>
          </Card>

          {/* Detalles del Servicio */}
          <Card className="industrial-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Detalles del Servicio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción del Trabajo</Label>
                <Textarea
                  id="descripcion"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Describe el trabajo a realizar..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="observaciones">Observaciones Adicionales</Label>
                <Textarea
                  id="observaciones"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Notas adicionales, instrucciones especiales..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Botones de Acción */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={guardando}>
              Cancelar
            </Button>
            <Button type="submit" disabled={guardando} className="bg-blue-600 hover:bg-blue-700 text-white">
              {guardando ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
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
