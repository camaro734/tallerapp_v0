"use client"

import { CardDescription } from "@/components/ui/card"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MainLayout } from "@/components/main-layout"
import { Plus, Search, Edit, Trash2 } from "lucide-react"
import * as db from "@/lib/db"
import type { Usuario } from "@/lib/db"

const roleTranslations: { [key in db.Rol]: string } = {
  admin: "Administrador",
  jefe_taller: "Jefe de Taller",
  tecnico: "Técnico",
  recepcion: "Recepción",
}

export default function PersonalPage() {
  const [personal, setPersonal] = useState<Usuario[]>([])
  const [filteredPersonal, setFilteredPersonal] = useState<Usuario[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null)
  const [error, setError] = useState("")

  // Form states
  const [formData, setFormData] = useState({
    email: "",
    nombre: "",
    apellidos: "",
    dni: "",
    telefono: "",
    rol: "tecnico" as db.Rol,
    activo: true,
  })

  useEffect(() => {
    const fetchPersonal = async () => {
      setIsLoading(true)
      const { data, error } = await db.getUsuarios()
      if (data) {
        setPersonal(data)
        setFilteredPersonal(data)
      } else {
        console.error("Error fetching users:", error)
      }
      setIsLoading(false)
    }
    fetchPersonal()
  }, [])

  useEffect(() => {
    const results = personal.filter(
      (persona) =>
        persona.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        persona.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
        persona.email.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredPersonal(results)
  }, [searchTerm, personal])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      // Validation
      if (!formData.email || !formData.nombre || !formData.apellidos || !formData.dni) {
        setError("Todos los campos obligatorios deben estar completos")
        return
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        setError("El formato del email no es válido")
        return
      }

      if (editingUsuario) {
        // Update existing usuario
        await db.updateUsuario(editingUsuario.id, formData)
        // toast({
        //   title: "Usuario actualizado",
        //   description: "Los datos del usuario se han actualizado correctamente",
        // })
      } else {
        // Create new usuario
        await db.createUsuario(formData)
        // toast({
        //   title: "Usuario creado",
        //   description: "El nuevo usuario se ha creado correctamente",
        // })
      }

      // Reset form and close dialog
      resetForm()
      setIsDialogOpen(false)
      // cargarUsuarios()
    } catch (error) {
      console.error("Error guardando usuario:", error)
      setError("Error al guardar el usuario")
    }
  }

  const handleEdit = (usuario: Usuario) => {
    setEditingUsuario(usuario)
    setFormData({
      email: usuario.email,
      nombre: usuario.nombre,
      apellidos: usuario.apellidos,
      dni: usuario.dni,
      telefono: usuario.telefono || "",
      rol: usuario.rol,
      activo: usuario.activo,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (usuario: Usuario) => {
    try {
      await db.deleteUsuario(usuario.id)
      // toast({
      //   title: "Usuario eliminado",
      //   description: "El usuario se ha eliminado correctamente",
      // })
      // cargarUsuarios()
    } catch (error) {
      console.error("Error eliminando usuario:", error)
      // toast({
      //   title: "Error",
      //   description: "No se pudo eliminar el usuario",
      //   variant: "destructive",
      // })
    }
  }

  const resetForm = () => {
    setFormData({
      email: "",
      nombre: "",
      apellidos: "",
      dni: "",
      telefono: "",
      rol: "tecnico",
      activo: true,
    })
    setEditingUsuario(null)
    setError("")
  }

  const getRoleBadgeColor = (rol: db.Rol) => {
    switch (rol) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "jefe_taller":
        return "bg-blue-100 text-blue-800"
      case "tecnico":
        return "bg-green-100 text-green-800"
      case "recepcion":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRoleDisplayName = (rol: db.Rol) => {
    return roleTranslations[rol]
  }

  const getInitials = (nombre: string, apellidos: string) => {
    return `${nombre.charAt(0)}${apellidos.charAt(0)}`.toUpperCase()
  }

  // Statistics
  const totalUsuarios = personal.length
  const usuariosActivos = personal.filter((u) => u.activo).length
  const usuariosInactivos = personal.filter((u) => !u.activo).length
  const tecnicos = personal.filter((u) => u.rol === "tecnico").length

  return (
    <MainLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Gestión de Personal</h1>
            <p className="text-muted-foreground">Administra los usuarios del sistema</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Usuario
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingUsuario ? "Editar Usuario" : "Nuevo Usuario"}</DialogTitle>
                <DialogDescription>
                  {editingUsuario ? "Modifica los datos del usuario" : "Completa los datos del nuevo usuario"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <div className="flex items-center">
                      <span className="mr-2">Error:</span>
                      <AlertDescription>{error}</AlertDescription>
                    </div>
                  </Alert>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre *</Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      placeholder="Juan"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apellidos">Apellidos *</Label>
                    <Input
                      id="apellidos"
                      value={formData.apellidos}
                      onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                      placeholder="Pérez López"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="juan@cmgplataformas.com"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dni">DNI *</Label>
                    <Input
                      id="dni"
                      value={formData.dni}
                      onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                      placeholder="12345678A"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      placeholder="666123456"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rol">Rol *</Label>
                    <Select
                      value={formData.rol}
                      onValueChange={(value: db.Rol) => setFormData({ ...formData, rol: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="jefe_taller">Jefe de Taller</SelectItem>
                        <SelectItem value="tecnico">Técnico</SelectItem>
                        <SelectItem value="recepcion">Recepción</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="activo">Estado</Label>
                    <Select
                      value={formData.activo ? "true" : "false"}
                      onValueChange={(value) => setFormData({ ...formData, activo: value === "true" })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Activo</SelectItem>
                        <SelectItem value="false">Inactivo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">{editingUsuario ? "Actualizar" : "Crear"}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
              {/* <Users className="h-4 w-4 text-muted-foreground" /> */}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsuarios}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
              {/* <UserCheck className="h-4 w-4 text-green-600" /> */}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{usuariosActivos}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios Inactivos</CardTitle>
              {/* <UserX className="h-4 w-4 text-red-600" /> */}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{usuariosInactivos}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Técnicos</CardTitle>
              {/* <Shield className="h-4 w-4 text-blue-600" /> */}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{tecnicos}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Buscar Personal</CardTitle>
            <CardDescription>Busca por nombre, apellidos, email, DNI o teléfono</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Personal ({filteredPersonal.length})</CardTitle>
            <CardDescription>Gestiona todos los usuarios del sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPersonal.map((persona) => (
                    <TableRow key={persona.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback>{getInitials(persona.nombre, persona.apellidos)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {persona.nombre} {persona.apellidos}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center">
                              {/* <IdCard className="h-3 w-3 mr-1" /> */}
                              {persona.dni}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm flex items-center">
                            {/* <Mail className="h-3 w-3 mr-1" /> */}
                            {persona.email}
                          </div>
                          {persona.telefono && (
                            <div className="text-sm text-muted-foreground flex items-center">
                              {/* <Phone className="h-3 w-3 mr-1" /> */}
                              {persona.telefono}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeColor(persona.rol)}>{getRoleDisplayName(persona.rol)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={persona.activo ? "default" : "secondary"}>
                          {persona.activo ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(persona)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. Se eliminará permanentemente el usuario{" "}
                                  <strong>
                                    {persona.nombre} {persona.apellidos}
                                  </strong>{" "}
                                  del sistema.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(persona)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredPersonal.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm
                    ? "No se encontraron usuarios que coincidan con la búsqueda"
                    : "No hay usuarios registrados"}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
