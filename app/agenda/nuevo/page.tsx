"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { LoginForm } from "@/components/login-form"
import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { ArrowLeft, Calendar, User, Car, Wrench, Phone, Mail, Loader2 } from "lucide-react"
import { createCita } from "@/lib/db"

export default function NuevaCitaPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // Estados del formulario
  const [clienteNombre, setClienteNombre] = useState("")
  const [clienteTelefono, setClienteTelefono] = useState("")
  const [clienteEmail, setClienteEmail] = useState("")
  const [vehiculoMatricula, setVehiculoMatricula] = useState("")
  const [vehiculoMarca, setVehiculoMarca] = useState("")
  const [vehiculoModelo, setVehiculoModelo] = useState("")
  const [fecha, setFecha] = useState("")
  const [hora, setHora] = useState("")
  const [tipoServicio, setTipoServicio] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [observaciones, setObservaciones] = useState("")

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
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
    "18:30",
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!clienteNombre.trim()) {
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

    setIsLoading(true)

    try {
      // Crear el motivo combinando tipo de servicio y descripción
      let motivoCombinado = tipoServicio
      if (descripcion.trim()) {
        motivoCombinado += ` - ${descripcion.trim()}`
      }

      // Crear la cita con información del cliente incluida
      const nuevaCita = await createCita({
        usuario_id: user!.id,
        fecha,
        hora,
        motivo: motivoCombinado,
        // Información adicional que se puede almacenar en observaciones
        observaciones: JSON.stringify({
          cliente: {
            nombre: clienteNombre.trim(),
            telefono: clienteTelefono.trim() || null,
            email: clienteEmail.trim() || null,
          },
          vehiculo: {
            matricula: vehiculoMatricula.trim() || null,
            marca: vehiculoMarca.trim() || null,
            modelo: vehiculoModelo.trim() || null,
          },
          observaciones: observaciones.trim() || null,
        }),
      })

      toast({
        title: "Cita creada",
        description: `Cita programada para ${fecha} a las ${hora}`,
      })

      router.push("/agenda")
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

  if (authLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </MainLayout>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  return (
    <MainLayout>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button asChild variant="outline" size="sm" className="mb-4 bg-transparent">
            <Link href="/agenda">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Agenda
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Nueva Cita</h1>
            <p className="text-gray-600">Programa una nueva cita de servicio</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Información del Cliente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Información del Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="cliente_nombre">Nombre del Cliente *</Label>
                  <Input
                    id="cliente_nombre"
                    value={clienteNombre}
                    onChange={(e) => setClienteNombre(e.target.value)}
                    placeholder="Nombre completo o empresa"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cliente_telefono">Teléfono</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="cliente_telefono"
                      value={clienteTelefono}
                      onChange={(e) => setClienteTelefono(e.target.value)}
                      placeholder="666 123 456"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="cliente_email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="cliente_email"
                      type="email"
                      value={clienteEmail}
                      onChange={(e) => setClienteEmail(e.target.value)}
                      placeholder="cliente@ejemplo.com"
                      className="pl-10"
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
                <div>
                  <Label htmlFor="vehiculo_matricula">Matrícula</Label>
                  <Input
                    id="vehiculo_matricula"
                    value={vehiculoMatricula}
                    onChange={(e) => setVehiculoMatricula(e.target.value.toUpperCase())}
                    placeholder="1234ABC"
                  />
                </div>
                <div>
                  <Label htmlFor="vehiculo_marca">Marca</Label>
                  <Input
                    id="vehiculo_marca"
                    value={vehiculoMarca}
                    onChange={(e) => setVehiculoMarca(e.target.value)}
                    placeholder="Mercedes, Volvo, Scania..."
                  />
                </div>
                <div>
                  <Label htmlFor="vehiculo_modelo">Modelo</Label>
                  <Input
                    id="vehiculo_modelo"
                    value={vehiculoModelo}
                    onChange={(e) => setVehiculoModelo(e.target.value)}
                    placeholder="Actros, FH, R450..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Información de la Cita */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Programación de la Cita
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="fecha">Fecha *</Label>
                  <Input
                    id="fecha"
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="hora">Hora *</Label>
                  <Select value={hora} onValueChange={setHora} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar hora" />
                    </SelectTrigger>
                    <SelectContent>
                      {horasDisponibles.map((horaDisponible) => (
                        <SelectItem key={horaDisponible} value={horaDisponible}>
                          {horaDisponible}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="tipo_servicio">Tipo de Servicio *</Label>
                  <Select value={tipoServicio} onValueChange={setTipoServicio} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
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

          {/* Detalles del Servicio */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-blue-600" />
                Detalles del Servicio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="descripcion">Descripción del Trabajo</Label>
                <Textarea
                  id="descripcion"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Describe el trabajo a realizar, problema reportado, etc..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="observaciones">Observaciones Adicionales</Label>
                <Textarea
                  id="observaciones"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Notas adicionales, instrucciones especiales, etc..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Botones de Acción */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={() => router.push("/agenda")} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Calendar className="mr-2 h-4 w-4" />
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
