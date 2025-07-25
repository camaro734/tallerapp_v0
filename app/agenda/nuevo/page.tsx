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
import { CalendarIcon, Clock, ArrowLeft } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { getClientes, getVehiculos, type Cliente, type Vehiculo } from "@/lib/database"
import { useAuth } from "@/components/auth-provider"
import { MainLayout } from "@/components/main-layout"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function NuevaCitaPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([])
  const [vehiculosFiltrados, setVehiculosFiltrados] = useState<Vehiculo[]>([])

  // Estados del formulario
  const [clienteSeleccionado, setClienteSeleccionado] = useState<string>("")
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState<string>("")
  const [fecha, setFecha] = useState<Date>()
  const [hora, setHora] = useState("")
  const [duracion, setDuracion] = useState("")
  const [tipoServicio, setTipoServicio] = useState("")
  const [descripcion, setDescripcion] = useState("")

  useEffect(() => {
    cargarDatos()
  }, [])

  useEffect(() => {
    if (clienteSeleccionado) {
      cargarVehiculosCliente(clienteSeleccionado)
    } else {
      setVehiculosFiltrados([])
      setVehiculoSeleccionado("")
    }
  }, [clienteSeleccionado])

  const cargarDatos = async () => {
    try {
      const [clientesResponse, vehiculosResponse] = await Promise.all([getClientes(), getVehiculos()])

      if (clientesResponse.error) {
        throw new Error(clientesResponse.error.message)
      }
      if (vehiculosResponse.error) {
        throw new Error(vehiculosResponse.error.message)
      }

      setClientes(clientesResponse.data || [])
      setVehiculos(vehiculosResponse.data || [])
    } catch (error) {
      console.error("Error cargando datos:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos necesarios",
        variant: "destructive",
      })
    }
  }

  const cargarVehiculosCliente = async (clienteId: string) => {
    try {
      const vehiculosCliente = vehiculos.filter((v) => v.cliente_id === clienteId)
      setVehiculosFiltrados(vehiculosCliente)
    } catch (error) {
      console.error("Error cargando vehículos:", error)
      setVehiculosFiltrados([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!clienteSeleccionado || !fecha || !hora || !duracion || !tipoServicio) {
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
        cliente_id: clienteSeleccionado,
        vehiculo_id: vehiculoSeleccionado || undefined,
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Información de la Cita
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Cliente */}
              <div>
                <Label htmlFor="cliente">Cliente *</Label>
                <Select value={clienteSeleccionado} onValueChange={setClienteSeleccionado} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{cliente.nombre}</span>
                          {cliente.telefono && <span className="text-sm text-gray-500">{cliente.telefono}</span>}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Vehículo */}
              <div>
                <Label htmlFor="vehiculo">Vehículo</Label>
                <Select
                  value={vehiculoSeleccionado}
                  onValueChange={setVehiculoSeleccionado}
                  disabled={!clienteSeleccionado}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un vehículo (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehiculosFiltrados.map((vehiculo) => (
                      <SelectItem key={vehiculo.id} value={vehiculo.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{vehiculo.matricula}</span>
                          <span className="text-sm text-gray-500">
                            {vehiculo.marca} {vehiculo.modelo}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!clienteSeleccionado && <p className="text-sm text-gray-500 mt-1">Selecciona primero un cliente</p>}
              </div>

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
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
