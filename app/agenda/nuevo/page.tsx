"use client"

import type * as React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { type Cliente, type Vehiculo, getClientes, getVehiculosByClienteId, createCita } from "@/lib/db"
import { cn } from "@/lib/utils"

export default function NuevaCitaPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [clientes, setClientes] = useState<Cliente[]>([])
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([])
  const [selectedCliente, setSelectedCliente] = useState<string | null>(null)
  const [isNewCliente, setIsNewCliente] = useState(false)
  const [newClienteName, setNewClienteName] = useState("")

  const [fecha, setFecha] = useState<Date | undefined>(new Date())
  const [hora, setHora] = useState("09:00")
  const [tipoServicio, setTipoServicio] = useState("")
  const [duracion, setDuracion] = useState("60")
  const [descripcion, setDescripcion] = useState("")

  useEffect(() => {
    const fetchClientes = async () => {
      const { data } = await getClientes()
      if (data) setClientes(data)
    }
    fetchClientes()
  }, [])

  useEffect(() => {
    const fetchVehiculos = async () => {
      if (selectedCliente) {
        const { data } = await getVehiculosByClienteId(selectedCliente)
        if (data) setVehiculos(data)
      } else {
        setVehiculos([])
      }
    }
    if (!isNewCliente) {
      fetchVehiculos()
    }
  }, [selectedCliente, isNewCliente])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if ((!isNewCliente && !selectedCliente) || (isNewCliente && !newClienteName)) {
      toast({
        variant: "destructive",
        title: "Error de validación",
        description: "Por favor, selecciona o introduce un nombre de cliente.",
      })
      return
    }
    if (!fecha) {
      toast({
        variant: "destructive",
        title: "Error de validación",
        description: "Por favor, selecciona una fecha para la cita.",
      })
      return
    }

    setIsSubmitting(true)

    const fechaHora = new Date(fecha)
    const [h, m] = hora.split(":").map(Number)
    fechaHora.setHours(h, m)

    const citaData = {
      cliente_id: !isNewCliente ? selectedCliente : null,
      cliente_nombre: isNewCliente ? newClienteName : null,
      vehiculo_id: null, // Simplificado por ahora
      fecha_hora: fechaHora.toISOString(),
      duracion_estimada: Number.parseInt(duracion, 10),
      tipo_servicio: tipoServicio,
      descripcion: descripcion,
      estado: "programada" as const,
      created_by: "5", // Hardcoded user ID for demo
    }

    const { data, error } = await createCita(citaData)

    if (error) {
      toast({
        variant: "destructive",
        title: "Error al crear la cita",
        description: error.message,
      })
      setIsSubmitting(false)
    } else {
      toast({
        title: "Cita creada",
        description: `La cita para ${data.cliente_nombre || clientes.find((c) => c.id === data.cliente_id)?.nombre} ha sido creada con éxito.`,
      })
      router.push("/agenda")
    }
  }

  return (
    <MainLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Crear Nueva Cita</CardTitle>
            <CardDescription>Rellena los detalles para programar una nueva cita en la agenda.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch id="new-cliente-switch" checked={isNewCliente} onCheckedChange={setIsNewCliente} />
                  <Label htmlFor="new-cliente-switch">Cliente Nuevo / Sin registrar</Label>
                </div>
              </div>

              {isNewCliente ? (
                <div className="space-y-2">
                  <Label htmlFor="new-cliente-name">Nombre del Cliente</Label>
                  <Input
                    id="new-cliente-name"
                    value={newClienteName}
                    onChange={(e) => setNewClienteName(e.target.value)}
                    placeholder="Ej: Transportes Sol"
                    required
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="cliente">Cliente</Label>
                  <Select onValueChange={setSelectedCliente} value={selectedCliente || ""} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientes.map((cliente) => (
                        <SelectItem key={cliente.id} value={cliente.id}>
                          {cliente.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fecha">Fecha de la Cita</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn("w-full justify-start text-left font-normal", !fecha && "text-muted-foreground")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {fecha ? format(fecha, "PPP", { locale: es }) : <span>Elige una fecha</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={fecha} onSelect={setFecha} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hora">Hora</Label>
                  <Input id="hora" type="time" value={hora} onChange={(e) => setHora(e.target.value)} required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="tipo-servicio">Tipo de Servicio</Label>
                  <Input
                    id="tipo-servicio"
                    value={tipoServicio}
                    onChange={(e) => setTipoServicio(e.target.value)}
                    placeholder="Ej: Revisión, Reparación"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duracion">Duración (minutos)</Label>
                  <Input
                    id="duracion"
                    type="number"
                    value={duracion}
                    onChange={(e) => setDuracion(e.target.value)}
                    placeholder="Ej: 60"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción (Opcional)</Label>
                <Textarea
                  id="descripcion"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Añade detalles sobre el trabajo a realizar..."
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? "Guardando..." : "Guardar Cita"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </MainLayout>
  )
}
