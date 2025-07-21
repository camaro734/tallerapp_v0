"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { createParte, getClientes, getUsuarios, TipoTrabajo } from "@/lib/db"
import type { Cliente, Usuario } from "@/lib/db"
import { ScrollArea } from "@/components/ui/scroll-area"

const formSchema = z.object({
  isNewClient: z.boolean().default(false),
  cliente_id: z.string().optional(),
  cliente_nombre: z.string().optional(),
  vehiculo_matricula: z.string().min(1, "La matrícula es obligatoria."),
  vehiculo_marca: z.string().optional(),
  vehiculo_modelo: z.string().optional(),
  vehiculo_serie: z.string().optional(),
  tecnico_id: z.string().optional(),
  tipo_trabajo: z.nativeEnum(TipoTrabajo).optional(),
  descripcion: z.string().min(1, "La descripción es obligatoria."),
})

type FormValues = z.infer<typeof formSchema>

interface NuevoParteFormProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onParteCreado: () => void
  currentUser: Usuario
}

export default function NuevoParteForm({ isOpen, onOpenChange, onParteCreado, currentUser }: NuevoParteFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [tecnicos, setTecnicos] = useState<Usuario[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isNewClient: false,
      descripcion: "",
    },
  })

  const isNewClient = form.watch("isNewClient")

  useEffect(() => {
    async function fetchData() {
      const { data: clientesData } = await getClientes()
      const { data: usuariosData } = await getUsuarios()
      if (clientesData) setClientes(clientesData)
      if (usuariosData) {
        setTecnicos(usuariosData.filter((u) => u.rol === "tecnico" || u.rol === "jefe_taller"))
      }
    }
    fetchData()
  }, [])

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true)
    try {
      if (values.isNewClient && !values.cliente_nombre) {
        form.setError("cliente_nombre", {
          type: "manual",
          message: "El nombre del cliente es obligatorio.",
        })
        setIsLoading(false)
        return
      }
      if (!values.isNewClient && !values.cliente_id) {
        form.setError("cliente_id", {
          type: "manual",
          message: "Debe seleccionar un cliente.",
        })
        setIsLoading(false)
        return
      }

      const nextPartNumber = `PT-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`

      const parteData = {
        numero_parte: nextPartNumber,
        cliente_id: values.isNewClient ? null : values.cliente_id,
        cliente_nombre: values.isNewClient
          ? values.cliente_nombre
          : clientes.find((c) => c.id === values.cliente_id)?.nombre,
        vehiculo_id: null, // No se asocia a un vehículo existente
        vehiculo_matricula: values.vehiculo_matricula,
        vehiculo_marca: values.vehiculo_marca,
        vehiculo_modelo: values.vehiculo_modelo,
        vehiculo_serie: values.vehiculo_serie,
        tecnico_id: values.tecnico_id || null,
        tipo_trabajo: values.tipo_trabajo || null,
        descripcion: values.descripcion,
        estado: "pendiente" as const,
        prioridad: "media" as const,
        created_by: currentUser.id,
        validado: false,
      }

      const { data: nuevoParte, error } = await createParte(parteData)

      if (error) {
        throw new Error(error.message)
      }

      toast({
        title: "Parte de trabajo creado",
        description: `El parte ${nuevoParte?.numero_parte} ha sido creado con éxito.`,
      })
      onParteCreado()
      onOpenChange(false)
      form.reset()
    } catch (error) {
      console.error("Error al crear el parte:", error)
      toast({
        title: "Error",
        description: "No se pudo crear el parte de trabajo. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] grid-rows-[auto_1fr_auto] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Parte de Trabajo</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-full">
          <form id="nuevo-parte-form" onSubmit={form.handleSubmit(onSubmit)} className="p-4 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Controller
                  control={form.control}
                  name="isNewClient"
                  render={({ field }) => (
                    <Switch id="isNewClient" checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
                <Label htmlFor="isNewClient">Cliente Nuevo / Sin registrar</Label>
              </div>
            </div>

            {isNewClient ? (
              <div className="space-y-2">
                <Label htmlFor="cliente_nombre">Nombre del Cliente</Label>
                <Input id="cliente_nombre" {...form.register("cliente_nombre")} placeholder="Ej: Juan Pérez" />
                {form.formState.errors.cliente_nombre && (
                  <p className="text-sm text-red-500">{form.formState.errors.cliente_nombre.message}</p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="cliente_id">Cliente</Label>
                <Controller
                  control={form.control}
                  name="cliente_id"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  )}
                />
                {form.formState.errors.cliente_id && (
                  <p className="text-sm text-red-500">{form.formState.errors.cliente_id.message}</p>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehiculo_matricula">Matrícula</Label>
                <Input id="vehiculo_matricula" {...form.register("vehiculo_matricula")} placeholder="Ej: 1234 ABC" />
                {form.formState.errors.vehiculo_matricula && (
                  <p className="text-sm text-red-500">{form.formState.errors.vehiculo_matricula.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehiculo_marca">Marca</Label>
                <Input id="vehiculo_marca" {...form.register("vehiculo_marca")} placeholder="Ej: DAF" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehiculo_modelo">Modelo</Label>
                <Input id="vehiculo_modelo" {...form.register("vehiculo_modelo")} placeholder="Ej: XF" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehiculo_serie">Serie</Label>
                <Input id="vehiculo_serie" {...form.register("vehiculo_serie")} placeholder="Ej: SN12345XYZ" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tecnico_id">Técnico Asignado (Opcional)</Label>
                <Controller
                  control={form.control}
                  name="tecnico_id"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un técnico" />
                      </SelectTrigger>
                      <SelectContent>
                        {tecnicos.map((tecnico) => (
                          <SelectItem key={tecnico.id} value={tecnico.id}>
                            {tecnico.nombre} {tecnico.apellidos}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipo_trabajo">Tipo de Trabajo (Opcional)</Label>
                <Controller
                  control={form.control}
                  name="tipo_trabajo"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="reparacion">Reparación</SelectItem>
                        <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                        <SelectItem value="revision">Revisión</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción del Trabajo</Label>
              <Textarea
                id="descripcion"
                {...form.register("descripcion")}
                placeholder="Describe el problema o la tarea a realizar"
              />
              {form.formState.errors.descripcion && (
                <p className="text-sm text-red-500">{form.formState.errors.descripcion.message}</p>
              )}
            </div>
          </form>
        </ScrollArea>
        <DialogFooter className="pt-4">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </DialogClose>
          <Button type="submit" form="nuevo-parte-form" disabled={isLoading}>
            {isLoading ? "Creando..." : "Crear Parte"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
