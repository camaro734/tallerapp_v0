"use client"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"
import { getVacaciones, createVacacion, updateVacacion, canApproveVacations } from "@/lib/db"
import type { Vacacion } from "@/lib/db"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, CheckIcon, Cross2Icon } from "@radix-ui/react-icons"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"

const vacationSchema = z
  .object({
    fecha_inicio: z.date({ required_error: "La fecha de inicio es obligatoria." }),
    fecha_fin: z.date({ required_error: "La fecha de fin es obligatoria." }),
    comentarios: z.string().optional(),
  })
  .refine((data) => data.fecha_fin >= data.fecha_inicio, {
    message: "La fecha de fin no puede ser anterior a la fecha de inicio.",
    path: ["fecha_fin"],
  })

type VacationFormValues = z.infer<typeof vacationSchema>

export default function VacacionesPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [vacaciones, setVacaciones] = useState<Vacacion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const form = useForm<VacationFormValues>({
    resolver: zodResolver(vacationSchema),
  })

  const fetchVacaciones = async () => {
    setIsLoading(true)
    try {
      const { data } = await getVacaciones()
      if (data) {
        const sortedData = data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        setVacaciones(sortedData)
      }
    } catch (error) {
      toast({ title: "Error", description: "No se pudieron cargar las vacaciones.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchVacaciones()
  }, [])

  const handleRequestVacation = async (values: VacationFormValues) => {
    if (!user) return
    try {
      const newVacationData = {
        usuario_id: user.id,
        fecha_inicio: values.fecha_inicio.toISOString().split("T")[0],
        fecha_fin: values.fecha_fin.toISOString().split("T")[0],
        estado: "pendiente" as const,
        comentarios: values.comentarios,
      }
      await createVacacion(newVacationData)
      toast({ title: "Solicitud enviada", description: "Tu solicitud de vacaciones ha sido enviada." })
      fetchVacaciones()
      setIsDialogOpen(false)
      form.reset()
    } catch (error) {
      toast({ title: "Error", description: "No se pudo enviar la solicitud.", variant: "destructive" })
    }
  }

  const handleApproveOrReject = async (id: string, estado: "aprobada" | "rechazada") => {
    if (!user) return
    try {
      await updateVacacion(id, { estado, aprobado_por: user.id })
      toast({
        title: `Solicitud ${estado}`,
        description: `La solicitud de vacaciones ha sido ${estado}.`,
      })
      fetchVacaciones()
    } catch (error) {
      toast({ title: "Error", description: "No se pudo actualizar la solicitud.", variant: "destructive" })
    }
  }

  const canApprove = canApproveVacations(user?.rol)

  const getBadgeVariant = (estado: Vacacion["estado"]) => {
    switch (estado) {
      case "aprobada":
        return "success"
      case "rechazada":
        return "destructive"
      case "pendiente":
        return "secondary"
      default:
        return "default"
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Gestión de Vacaciones</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Solicitar Vacaciones</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nueva Solicitud de Vacaciones</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(handleRequestVacation)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fecha de Inicio</Label>
                  <Controller
                    control={form.control}
                    name="fecha_inicio"
                    render={({ field }) => (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(field.value, "PPP", { locale: es })
                            ) : (
                              <span>Selecciona una fecha</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                  {form.formState.errors.fecha_inicio && (
                    <p className="text-sm text-red-500">{form.formState.errors.fecha_inicio.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Fecha de Fin</Label>
                  <Controller
                    control={form.control}
                    name="fecha_fin"
                    render={({ field }) => (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(field.value, "PPP", { locale: es })
                            ) : (
                              <span>Selecciona una fecha</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                  {form.formState.errors.fecha_fin && (
                    <p className="text-sm text-red-500">{form.formState.errors.fecha_fin.message}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="comentarios">Comentarios (Opcional)</Label>
                <Textarea id="comentarios" {...form.register("comentarios")} />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="ghost">Cancelar</Button>
                </DialogClose>
                <Button type="submit">Enviar Solicitud</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Solicitudes</CardTitle>
          <CardDescription>
            {canApprove
              ? "Aquí puedes ver y gestionar todas las solicitudes de vacaciones."
              : "Aquí puedes ver el estado de tus solicitudes de vacaciones."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {canApprove && <TableHead>Empleado</TableHead>}
                <TableHead>Fecha de Inicio</TableHead>
                <TableHead>Fecha de Fin</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Comentarios</TableHead>
                {canApprove && <TableHead className="text-right">Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={canApprove ? 6 : 5} className="text-center">
                    Cargando...
                  </TableCell>
                </TableRow>
              ) : vacaciones.filter((v) => canApprove || v.usuario_id === user?.id).length > 0 ? (
                vacaciones
                  .filter((v) => canApprove || v.usuario_id === user?.id)
                  .map((v) => (
                    <TableRow key={v.id}>
                      {canApprove && (
                        <TableCell>
                          {v.usuario?.nombre} {v.usuario?.apellidos}
                        </TableCell>
                      )}
                      <TableCell>{format(new Date(v.fecha_inicio), "dd/MM/yyyy")}</TableCell>
                      <TableCell>{format(new Date(v.fecha_fin), "dd/MM/yyyy")}</TableCell>
                      <TableCell>
                        <Badge variant={getBadgeVariant(v.estado)}>{v.estado}</Badge>
                      </TableCell>
                      <TableCell>{v.comentarios || "-"}</TableCell>
                      {canApprove && v.estado === "pendiente" && (
                        <TableCell className="text-right space-x-2">
                          <Button
                            size="icon"
                            variant="outline"
                            className="bg-green-100 hover:bg-green-200"
                            onClick={() => handleApproveOrReject(v.id, "aprobada")}
                          >
                            <CheckIcon className="h-4 w-4 text-green-700" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            className="bg-red-100 hover:bg-red-200"
                            onClick={() => handleApproveOrReject(v.id, "rechazada")}
                          >
                            <Cross2Icon className="h-4 w-4 text-red-700" />
                          </Button>
                        </TableCell>
                      )}
                      {canApprove && v.estado !== "pendiente" && <TableCell></TableCell>}
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={canApprove ? 6 : 5} className="text-center">
                    No hay solicitudes de vacaciones.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
