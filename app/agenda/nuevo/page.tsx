"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Clock, ArrowLeft, User } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { getVehiculos, type Vehiculo } from "@/lib/database"
import { useAuth } from "@/components/auth-provider"
import { MainLayout } from "@/components/main-layout"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function NuevaCitaPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([])

  // Estados del formulario - Cliente manual
  const [clienteNombre, setClienteNombre] = useState("")
  const [clienteTelefono, setClienteTelefono] = useState("")
  const [clienteEmail, setClienteEmail] = useState("")

  // Estados del formulario - Vehículo manual
  const [vehiculoMatricula, setVehiculoMatricula] = useState("")
  const [vehiculoMarca, setVehiculoMarca] = useState("")
  const [vehiculoModelo, setVehiculoModelo] = useState("")

  // Estados del formulario - Cita
  const [fecha, setFecha] = useState<Date>()
  const [hora, setHora] = useState("")
  const [duracion, setDuracion] = useState("")
  const [tipoServicio, setTipoServicio] = useState("")
  const [descripcion, setDescripcion] = useState("")

  useEffect(() => {
    cargarVehiculos()
  }, [])

  const cargarVehiculos = async () => {
    try {
      const vehiculosResponse = await getVehiculos()

      if (vehiculosResponse.error) {
        throw new Error(vehiculosResponse.error.message)
      }

      setVehiculos(vehiculosResponse.data || [])
    } catch (error) {
      console.error("Error cargando vehículos:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los vehículos",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!clienteNombre.trim() || !fecha || !hora || !duracion || !tipoServicio) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Combinar fecha y hora
      const [horas, minutos] = hora.split(":").map(Number)
      const fechaHora = new Date(fecha)
      fechaHora.setHours(horas, minutos, 0, 0)

      const citaData = {
        cliente_nombre: clienteNombre.trim(),
        cliente_telefono: clienteTelefono.trim() || undefined,
        cliente_email: clienteEmail.trim() || undefined,
        vehiculo_matricula: vehiculoMatricula.trim() || undefined,
        vehiculo_marca: vehiculoMarca.trim() || undefined,
        vehiculo_modelo: vehiculoModelo.trim() || undefined,
        fecha_hora: fechaHora.toISOString(),
        duracion_estimada: Number.parseInt(duracion),
        tipo_servicio: tipoServicio,
        descripcion: descripcion.trim() || undefined,
        estado: "programada" as const,
        created_by: user!.id,
      }

      // Aquí iría la llamada a citasDB.create(citaData)
      // Por ahora simulamos el éxito
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Éxito",
        description: "Cita programada correctamente",
      })

      router.push("/agenda")
    } catch (error) {
      console.error("Error creando cita:", error)
      toast({
        title: "Error",
        description: "No se pudo programar la cita",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const horasDisponibles = Array.from({ length: 10 }, (_, i) => {
    const hora = 8 + i
    return `${hora.toString().padStart(2, "0")}:00`
  })

  return (
    <MainLayout>
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Nueva Cita</h1>
            <p className="text-gray-600">Programa una nueva cita en la agenda</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
                <Label htmlFor="cliente-nombre">Nombre del Cliente *</Label>
                <Input
                  id="cliente-nombre"
                  value={clienteNombre}
                  onChange={(e) => setClienteNombre(e.target.value)}
                  placeholder="Nombre completo o empresa"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cliente-telefono">Teléfono</Label>
                  <Input
                    id="cliente-telefono"
                    value={clienteTelefono}
                    onChange={(e) => setClienteTelefono(e.target.value)}
                    placeholder="666123456"
                    type="tel"
                  />
                </div>
                <div>
                  <Label htmlFor="cliente-email">Email</Label>
                  <Input
                    id="cliente-email"
                    value={clienteEmail}
                    onChange={(e) => setClienteEmail(e.target.value)}
                    placeholder="cliente@email.com"
                    type="email"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información del Vehículo */}
          <Card>
            <CardHeader>
              <CardTitle>Información del Vehículo (Opcional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="vehiculo-matricula">Matrícula</Label>
                  <Input
                    id="vehiculo-matricula"
                    value={vehiculoMatricula}
                    onChange={(e) => setVehiculoMatricula(e.target.value)}
                    placeholder="1234ABC"
                  />
                </div>
                <div>
                  <Label htmlFor="vehiculo-marca">Marca</Label>
                  <Input
                    id="vehiculo-marca"
                    value={vehiculoMarca}
                    onChange={(e) => setVehiculoMarca(e.target.value)}
                    placeholder="HIAB, Zepro, etc."
                  />
                </div>
                <div>
                  <Label htmlFor="vehiculo-modelo">Modelo</Label>
                  <Input
                    id="vehiculo-modelo"
                    value={vehiculoModelo}
                    onChange={(e) => setVehiculoModelo(e.target.value)}
                    placeholder="Xi166, ZS200, etc."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información de la Cita */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Información de la Cita
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Fecha y Hora */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Fecha *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("w-full justify-start text-left font-normal", !fecha && "text-muted-foreground")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {fecha ? format(fecha, "PPP", { locale: es }) : "Selecciona una fecha"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
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

                <div>
                  <Label htmlFor="hora">Hora *</Label>
                  <Select value={hora} onValueChange={setHora} required>
                    <SelectTrigger>
                      <Clock className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Selecciona la hora" />
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
              </div>

              {/* Duración y Tipo de Servicio */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duracion">Duración (minutos) *</Label>
                  <Select value={duracion} onValueChange={setDuracion} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Duración estimada" />
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

                <div>
                  <Label htmlFor="tipoServicio">Tipo de Servicio *</Label>
                  <Select value={tipoServicio} onValueChange={setTipoServicio} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo de servicio" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="revision">Revisión</SelectItem>
                      <SelectItem value="reparacion">Reparación</SelectItem>
                      <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                      <SelectItem value="instalacion">Instalación</SelectItem>
                      <SelectItem value="diagnostico">Diagnóstico</SelectItem>
                      <SelectItem value="presupuesto">Presupuesto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Descripción */}
              <div>
                <Label htmlFor="descripcion">Descripción</Label>
                <Input
                  id="descripcion"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Descripción breve del servicio..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? "Programando..." : "Programar Cita"}
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  )
}
