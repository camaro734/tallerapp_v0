"use client"

import { useState, useEffect, useMemo } from "react"
import { useAuth } from "@/components/auth-provider"
import { MainLayout } from "@/components/main-layout"
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario, type Usuario, canManageUsers } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { MoreHorizontal, PlusCircle, Trash2, Edit, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

const formSchema = z.object({
  nombre: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  apellidos: z.string().min(2, { message: "Los apellidos deben tener al menos 2 caracteres." }),
  email: z.string().email({ message: "Debe ser un email válido." }),
  password: z
    .string()
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres." })
    .optional()
    .or(z.literal("")),
  dni: z.string().optional(),
  telefono: z.string().optional(),
  rol: z.enum(["admin", "jefe_taller", "tecnico", "recepcion"]),
})

export default function PersonalPage() {
  const { user: authUser } = useAuth()
  const router = useRouter()
  const [personal, setPersonal] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const hasPermission = useMemo(() => canManageUsers(authUser?.rol), [authUser])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: "",
      apellidos: "",
      email: "",
      password: "",
      dni: "",
      telefono: "",
      rol: "tecnico",
    },
  })

  useEffect(() => {
    if (!authUser) {
      router.push("/")
      return
    }
    if (!hasPermission) {
      return
    }
    fetchPersonal()
  }, [authUser, hasPermission, router])

  useEffect(() => {
    if (isModalOpen) {
      if (selectedUser) {
        form.reset({
          nombre: selectedUser.nombre,
          apellidos: selectedUser.apellidos,
          email: selectedUser.email,
          password: "",
          dni: selectedUser.dni || "",
          telefono: selectedUser.telefono || "",
          rol: selectedUser.rol,
        })
      } else {
        form.reset({
          nombre: "",
          apellidos: "",
          email: "",
          password: "",
          dni: "",
          telefono: "",
          rol: "tecnico",
        })
      }
    }
  }, [selectedUser, isModalOpen, form])

  const fetchPersonal = async () => {
    setLoading(true)
    const { data } = await getUsuarios()
    if (data) {
      setPersonal(data)
    }
    setLoading(false)
  }

  const openModal = (user: Usuario | null = null) => {
    setSelectedUser(user)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedUser(null)
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)

    const userData: any = { ...values }
    if (!userData.password) {
      delete userData.password
    }

    let error = null
    if (selectedUser) {
      const { error: updateError } = await updateUsuario(selectedUser.id, userData)
      error = updateError
    } else {
      if (!userData.password) {
        form.setError("password", { type: "manual", message: "La contraseña es obligatoria para nuevos usuarios." })
        setIsSubmitting(false)
        return
      }
      const { password, ...rest } = userData
      const { error: createError } = await createUsuario(rest, password)
      error = createError
    }

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } else {
      toast({ title: "Éxito", description: `Usuario ${selectedUser ? "actualizado" : "creado"} correctamente.` })
      closeModal()
      fetchPersonal()
    }
    setIsSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este empleado?")) {
      const { error } = await deleteUsuario(id)
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" })
      } else {
        toast({ title: "Éxito", description: "Empleado eliminado correctamente." })
        fetchPersonal()
      }
    }
  }

  if (!hasPermission) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center">Acceso Denegado</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center">No tienes permisos para acceder a esta sección.</p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="p-4 md:p-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Gestión de Personal</CardTitle>
            <Button onClick={() => openModal()}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Empleado
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Activo</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        Cargando personal...
                      </TableCell>
                    </TableRow>
                  ) : personal.length > 0 ? (
                    personal.map((empleado) => (
                      <TableRow key={empleado.id}>
                        <TableCell>
                          {empleado.nombre} {empleado.apellidos}
                        </TableCell>
                        <TableCell>{empleado.email}</TableCell>
                        <TableCell>
                          <Badge>{empleado.rol}</Badge>
                        </TableCell>
                        <TableCell>{empleado.activo ? "Sí" : "No"}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Abrir menú</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openModal(empleado)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(empleado.id)} className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        No se encontraron empleados.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>{selectedUser ? "Editar Empleado" : "Añadir Nuevo Empleado"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre *</FormLabel>
                      <FormControl>
                        <Input placeholder="Juan" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="apellidos"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apellidos *</FormLabel>
                      <FormControl>
                        <Input placeholder="Pérez García" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="juan.perez@empresa.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña {selectedUser ? "(Opcional)" : "*"}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormDescription>
                      {selectedUser ? "Dejar en blanco para no cambiarla." : "Mínimo 6 caracteres."}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dni"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>DNI</FormLabel>
                      <FormControl>
                        <Input placeholder="12345678A" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="telefono"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <Input placeholder="600123456" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="rol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rol *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un rol" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="tecnico">Técnico</SelectItem>
                        <SelectItem value="jefe_taller">Jefe de Taller</SelectItem>
                        <SelectItem value="recepcion">Recepción</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="secondary" onClick={closeModal}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {selectedUser ? "Guardar Cambios" : "Crear Empleado"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  )
}
