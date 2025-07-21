"use client"

import { CardDescription } from "@/components/ui/card"

import type React from "react"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Download, Upload, Edit, Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { CSVImporter } from "@/components/csv-importer"
import { useAuth } from "@/components/auth-provider"
import { canManageClients, canImportData } from "@/lib/db"
import { LoginForm } from "@/components/login-form"
import * as db from "@/lib/db"
import type { Cliente } from "@/lib/db"

export default function ClientesPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null)
  const [showImporter, setShowImporter] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  // Formulario
  const [formData, setFormData] = useState({
    nombre: "",
    cif: "",
    telefono: "",
    email: "",
    direccion: "",
    contacto_principal: "",
    observaciones: "",
    activo: true,
  })

  useEffect(() => {
    const fetchClientes = async () => {
      setIsLoading(true)
      const { data, error } = await db.getClientes()
      if (data) {
        setClientes(data)
        setFilteredClientes(data)
      } else {
        console.error("Error fetching clients:", error)
      }
      setIsLoading(false)
    }
    if (!authLoading && user && canManageClients(user.rol)) {
      fetchClientes()
    }
  }, [authLoading, user])

  useEffect(() => {
    const results = clientes.filter(
      (cliente) =>
        cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cliente.cif && cliente.cif.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (cliente.contacto_principal && cliente.contacto_principal.toLowerCase().includes(searchTerm.toLowerCase())),
    )
    setFilteredClientes(results)
  }, [searchTerm, clientes])

  const resetForm = () => {
    setFormData({
      nombre: "",
      cif: "",
      telefono: "",
      email: "",
      direccion: "",
      contacto_principal: "",
      observaciones: "",
      activo: true,
    })
    setEditingCliente(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nombre || !formData.cif || !formData.telefono) {
      toast.error("Por favor, completa los campos obligatorios")
      return
    }

    if (editingCliente) {
      // Editar cliente existente
      const { error } = await db.updateCliente(editingCliente.id, formData)
      if (!error) {
        setClientes((prev) =>
          prev.map((cliente) =>
            cliente.id === editingCliente.id ? { ...cliente, ...formData, id: cliente.id } : cliente,
          ),
        )
        toast.success("Cliente actualizado correctamente")
      } else {
        console.error("Error updating client:", error)
        toast.error("Error al actualizar el cliente")
      }
    } else {
      // Crear nuevo cliente
      const { data: nuevoCliente, error } = await db.createCliente({
        ...formData,
        updated_at: new Date().toISOString(),
      })
      if (nuevoCliente) {
        setClientes((prev) => [...prev, nuevoCliente])
        toast.success("Cliente creado correctamente")
      } else {
        console.error("Error creating client:", error)
        toast.error("Error al crear el cliente")
      }
    }

    setIsDialogOpen(false)
    resetForm()
  }

  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente)
    setFormData({
      nombre: cliente.nombre,
      cif: cliente.cif || "",
      telefono: cliente.telefono || "",
      email: cliente.email || "",
      direccion: cliente.direccion || "",
      contacto_principal: cliente.contacto_principal || "",
      observaciones: cliente.observaciones || "",
      activo: cliente.activo,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    const { error } = await db.deleteCliente(id)
    if (!error) {
      setClientes((prev) => prev.filter((cliente) => cliente.id !== id))
      toast.success("Cliente eliminado correctamente")
    } else {
      console.error("Error deleting client:", error)
      toast.error("Error al eliminar el cliente")
    }
  }

  const exportToCSV = () => {
    const headers = ["nombre", "cif", "telefono", "email", "direccion", "contacto_principal", "observaciones", "activo"]
    const csvContent = [
      headers.join(","),
      ...filteredClientes.map((cliente) =>
        headers
          .map((header) => {
            const value = cliente[header as keyof Cliente]
            return typeof value === "string" ? `"${value}"` : value
          })
          .join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `clientes_${new Date().toISOString().split("T")[0]}.csv`
    link.click()
  }

  const handleImport = (data: any[]) => {
    data.forEach(async (row) => {
      const nuevoClienteData = {
        nombre: row.nombre || "",
        cif: row.cif || "",
        telefono: row.telefono || "",
        email: row.email || "",
        direccion: row.direccion || "",
        contacto_principal: row.contacto_principal || "",
        observaciones: row.observaciones || "",
        activo: row.activo === "true" || row.activo === true,
        updated_at: new Date().toISOString(),
      }
      const { data: nuevoCliente, error } = await db.createCliente(nuevoClienteData)
      if (nuevoCliente) {
        setClientes((prev) => [...prev, nuevoCliente])
        toast.success(`Cliente ${nuevoCliente.nombre} importado correctamente`)
      } else {
        console.error("Error importing client:", error)
        toast.error("Error al importar un cliente")
      }
    })

    setShowImporter(false)
  }

  const downloadTemplate = () => {
    const template = `nombre,cif,telefono,email,direccion,contacto_principal,observaciones,activo
"Transportes García S.L.","B12345678","666123456","info@transportesgarcia.com","Calle Industrial 1, Madrid","Juan García","Cliente preferente","true"
"Logística Martín","B87654321","677987654","contacto@logisticamartin.com","Polígono Sur 25, Barcelona","María Martín","Facturación mensual","true"
"Distribuciones López","B11223344","688112233","ventas@distlopez.com","Avenida Comercial 15, Valencia","Carlos López","Cliente desde 2020","true"`

    const blob = new Blob([template], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = "plantilla_clientes.csv"
    link.click()
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  if (!canManageClients(user.rol)) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Denegado</h1>
            <p className="text-gray-600">No tienes permisos para acceder a esta sección.</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
            <p className="text-muted-foreground">Gestión de clientes y contactos comerciales</p>
          </div>
          <div className="flex gap-2">
            {canImportData(user.rol) && (
              <Button variant="outline" onClick={() => setShowImporter(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Importar
              </Button>
            )}
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Cliente
            </Button>
          </div>
        </div>

        {/* Búsqueda y acciones */}
        <Card>
          <CardHeader>
            <CardTitle>Buscar Clientes</CardTitle>
            <CardDescription>Busca por nombre, CIF o contacto principal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar clientes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Button variant="outline" onClick={exportToCSV}>
                <Download className="mr-2 h-4 w-4" />
                Exportar CSV
              </Button>
              <Button variant="outline" onClick={downloadTemplate}>
                <Download className="mr-2 h-4 w-4" />
                Plantilla
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de clientes */}
        <Card>
          <CardHeader>
            <CardTitle>Clientes ({filteredClientes.length})</CardTitle>
            <CardDescription>Lista de todos los clientes registrados</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>CIF</TableHead>
                      <TableHead>Contacto</TableHead>
                      <TableHead>Teléfono</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClientes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No se encontraron clientes
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredClientes.map((cliente) => (
                        <TableRow key={cliente.id}>
                          <TableCell className="font-medium">
                            <div>
                              <div>{cliente.nombre}</div>
                              <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                                {cliente.direccion}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{cliente.cif || "N/A"}</TableCell>
                          <TableCell>{cliente.contacto_principal || "N/A"}</TableCell>
                          <TableCell>{cliente.telefono || "N/A"}</TableCell>
                          <TableCell>
                            <Badge variant={cliente.activo ? "default" : "secondary"}>
                              {cliente.activo ? "Activo" : "Inactivo"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleEdit(cliente)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => handleDelete(cliente.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog para crear/editar cliente */}
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) resetForm()
          }}
        >
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingCliente ? "Editar Cliente" : "Nuevo Cliente"}</DialogTitle>
              <DialogDescription>
                {editingCliente
                  ? "Modifica los datos del cliente seleccionado"
                  : "Completa la información para crear un nuevo cliente"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre *</Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => setFormData((prev) => ({ ...prev, nombre: e.target.value }))}
                      placeholder="Nombre de la empresa"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cif">CIF *</Label>
                    <Input
                      id="cif"
                      value={formData.cif}
                      onChange={(e) => setFormData((prev) => ({ ...prev, cif: e.target.value }))}
                      placeholder="B12345678"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono *</Label>
                    <Input
                      id="telefono"
                      value={formData.telefono}
                      onChange={(e) => setFormData((prev) => ({ ...prev, telefono: e.target.value }))}
                      placeholder="666123456"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="contacto@empresa.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="direccion">Dirección</Label>
                  <Input
                    id="direccion"
                    value={formData.direccion}
                    onChange={(e) => setFormData((prev) => ({ ...prev, direccion: e.target.value }))}
                    placeholder="Calle, número, ciudad"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contacto_principal">Contacto Principal</Label>
                  <Input
                    id="contacto_principal"
                    value={formData.contacto_principal}
                    onChange={(e) => setFormData((prev) => ({ ...prev, contacto_principal: e.target.value }))}
                    placeholder="Nombre del contacto"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observaciones">Observaciones</Label>
                  <Textarea
                    id="observaciones"
                    value={formData.observaciones}
                    onChange={(e) => setFormData((prev) => ({ ...prev, observaciones: e.target.value }))}
                    placeholder="Notas adicionales sobre el cliente"
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="activo"
                    checked={formData.activo}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, activo: checked }))}
                  />
                  <Label htmlFor="activo">Cliente activo</Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">{editingCliente ? "Actualizar" : "Crear"} Cliente</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Importador CSV */}
        {showImporter && canImportData(user.rol) && (
          <CSVImporter
            onImport={handleImport}
            onClose={() => setShowImporter(false)}
            expectedColumns={[
              "nombre",
              "cif",
              "telefono",
              "email",
              "direccion",
              "contacto_principal",
              "observaciones",
              "activo",
            ]}
            title="Importar Clientes"
            description="Sube un archivo CSV con los datos de los clientes"
          />
        )}
      </div>
    </MainLayout>
  )
}
