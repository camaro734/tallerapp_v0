"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { Plus, Camera, Upload, X } from "lucide-react"
import { clientes, createCliente, createParteTrabajo } from "@/lib/database"
import type { Cliente, FotoAdjunta } from "@/lib/database"

interface NuevoParteFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function NuevoParteForm({ onSuccess, onCancel }: NuevoParteFormProps) {
  const [formData, setFormData] = useState({
    cliente_id: "",
    cliente_nombre: "",
    vehiculo_matricula: "",
    vehiculo_marca: "",
    vehiculo_modelo: "",
    vehiculo_serie: "",
    descripcion: "",
    tecnico_asignado: "",
    tipo_trabajo: "",
    prioridad: "",
  })

  const [clientesData, setClientesData] = useState<Cliente[]>(clientes)
  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: "",
    cif: "",
    telefono: "",
    email: "",
    direccion: "",
    contacto_principal: "",
  })
  const [fotosAdjuntas, setFotosAdjuntas] = useState<FotoAdjunta[]>([])
  const [mostrarModalCliente, setMostrarModalCliente] = useState(false)
  const [cargandoCliente, setCargandoCliente] = useState(false)
  const [cargandoParte, setCargandoParte] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleClienteChange = (clienteId: string) => {
    const cliente = clientesData.find((c) => c.id === clienteId)
    setFormData((prev) => ({
      ...prev,
      cliente_id: clienteId,
      cliente_nombre: cliente?.nombre || "",
    }))
  }

  const handleNuevoClienteChange = (field: string, value: string) => {
    setNuevoCliente((prev) => ({ ...prev, [field]: value }))
  }

  const handleCrearCliente = async () => {
    if (!nuevoCliente.nombre.trim()) {
      toast({
        title: "Error",
        description: "El nombre del cliente es obligatorio",
        variant: "destructive",
      })
      return
    }

    setCargandoCliente(true)
    try {
      const clienteCreado = await createCliente(nuevoCliente)
      setClientesData((prev) => [...prev, clienteCreado])
      setFormData((prev) => ({
        ...prev,
        cliente_id: clienteCreado.id,
        cliente_nombre: clienteCreado.nombre,
      }))
      setNuevoCliente({
        nombre: "",
        cif: "",
        telefono: "",
        email: "",
        direccion: "",
        contacto_principal: "",
      })
      setMostrarModalCliente(false)
      toast({
        title: "Cliente creado",
        description: "El cliente se ha creado correctamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el cliente",
        variant: "destructive",
      })
    } finally {
      setCargandoCliente(false)
    }
  }

  const handleSeleccionarFotos = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const nuevaFoto: FotoAdjunta = {
            id: Math.random().toString(36).substr(2, 9),
            nombre: file.name,
            descripcion: "",
            url: e.target?.result as string,
            fecha_subida: new Date().toISOString(),
          }
          setFotosAdjuntas((prev) => [...prev, nuevaFoto])
        }
        reader.readAsDataURL(file)
      }
    })

    // Limpiar el input
    event.target.value = ""
  }

  const handleEliminarFoto = (fotoId: string) => {
    setFotosAdjuntas((prev) => prev.filter((foto) => foto.id !== fotoId))
  }

  const handleDescripcionFoto = (fotoId: string, descripcion: string) => {
    setFotosAdjuntas((prev) => prev.map((foto) => (foto.id === fotoId ? { ...foto, descripcion } : foto)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.descripcion.trim()) {
      toast({
        title: "Error",
        description: "La descripción del trabajo es obligatoria",
        variant: "destructive",
      })
      return
    }

    setCargandoParte(true)
    try {
      const parteData = {
        cliente_id: formData.cliente_id || null,
        cliente_nombre: formData.cliente_nombre || null,
        vehiculo_id: null,
        vehiculo_matricula: formData.vehiculo_matricula || null,
        vehiculo_marca: formData.vehiculo_marca || null,
        vehiculo_modelo: formData.vehiculo_modelo || null,
        vehiculo_serie: formData.vehiculo_serie || null,
        descripcion: formData.descripcion,
        tecnico_asignado: formData.tecnico_asignado || null,
        tipo_trabajo: formData.tipo_trabajo || null,
        prioridad: formData.prioridad || null,
        estado: "pendiente" as const,
        fecha_creacion: new Date().toISOString(),
        fecha_inicio: null,
        fecha_fin: null,
        tiempo_total: null,
        created_by: "user1", // En una app real, esto vendría del usuario autenticado
        firma_cliente: null,
        dni_cliente: null,
        fotos_adjuntas: fotosAdjuntas,
      }

      await createParteTrabajo(parteData)

      toast({
        title: "Parte creado",
        description: "El parte de trabajo se ha creado correctamente",
      })

      // Resetear formulario
      setFormData({
        cliente_id: "",
        cliente_nombre: "",
        vehiculo_matricula: "",
        vehiculo_marca: "",
        vehiculo_modelo: "",
        vehiculo_serie: "",
        descripcion: "",
        tecnico_asignado: "",
        tipo_trabajo: "",
        prioridad: "",
      })
      setFotosAdjuntas([])

      onSuccess?.()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el parte de trabajo",
        variant: "destructive",
      })
    } finally {
      setCargandoParte(false)
    }
  }

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cliente */}
        <div className="space-y-2">
          <Label htmlFor="cliente">Cliente *</Label>
          <div className="flex gap-2">
            <Select value={formData.cliente_id} onValueChange={handleClienteChange}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Seleccionar cliente habitual..." />
              </SelectTrigger>
              <SelectContent>
                {clientesData.map((cliente) => (
                  <SelectItem key={cliente.id} value={cliente.id}>
                    {cliente.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog open={mostrarModalCliente} onOpenChange={setMostrarModalCliente}>
              <DialogTrigger asChild>
                <Button type="button" variant="outline" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Nuevo Cliente</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nuevo-cliente-nombre">Nombre *</Label>
                    <Input
                      id="nuevo-cliente-nombre"
                      value={nuevoCliente.nombre}
                      onChange={(e) => handleNuevoClienteChange("nombre", e.target.value)}
                      placeholder="Nombre de la empresa"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nuevo-cliente-cif">CIF</Label>
                    <Input
                      id="nuevo-cliente-cif"
                      value={nuevoCliente.cif}
                      onChange={(e) => handleNuevoClienteChange("cif", e.target.value)}
                      placeholder="B12345678"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nuevo-cliente-telefono">Teléfono</Label>
                    <Input
                      id="nuevo-cliente-telefono"
                      value={nuevoCliente.telefono}
                      onChange={(e) => handleNuevoClienteChange("telefono", e.target.value)}
                      placeholder="666123456"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nuevo-cliente-email">Email</Label>
                    <Input
                      id="nuevo-cliente-email"
                      type="email"
                      value={nuevoCliente.email}
                      onChange={(e) => handleNuevoClienteChange("email", e.target.value)}
                      placeholder="contacto@empresa.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nuevo-cliente-direccion">Dirección</Label>
                    <Input
                      id="nuevo-cliente-direccion"
                      value={nuevoCliente.direccion}
                      onChange={(e) => handleNuevoClienteChange("direccion", e.target.value)}
                      placeholder="Calle Principal 123, Madrid"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nuevo-cliente-contacto">Contacto Principal</Label>
                    <Input
                      id="nuevo-cliente-contacto"
                      value={nuevoCliente.contacto_principal}
                      onChange={(e) => handleNuevoClienteChange("contacto_principal", e.target.value)}
                      placeholder="Juan García"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setMostrarModalCliente(false)}
                      disabled={cargandoCliente}
                    >
                      Cancelar
                    </Button>
                    <Button type="button" onClick={handleCrearCliente} disabled={cargandoCliente}>
                      {cargandoCliente ? "Creando..." : "Crear Cliente"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          {!formData.cliente_id && (
            <Input
              placeholder="O escribir nombre de cliente no habitual..."
              value={formData.cliente_nombre}
              onChange={(e) => handleInputChange("cliente_nombre", e.target.value)}
            />
          )}
        </div>

        {/* Información del Vehículo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Información del Vehículo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehiculo-matricula">Matrícula</Label>
                <Input
                  id="vehiculo-matricula"
                  value={formData.vehiculo_matricula}
                  onChange={(e) => handleInputChange("vehiculo_matricula", e.target.value)}
                  placeholder="1234 ABC"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehiculo-marca">Marca</Label>
                <Input
                  id="vehiculo-marca"
                  value={formData.vehiculo_marca}
                  onChange={(e) => handleInputChange("vehiculo_marca", e.target.value)}
                  placeholder="HIAB, Zepro, Dhollandia..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehiculo-modelo">Modelo</Label>
                <Input
                  id="vehiculo-modelo"
                  value={formData.vehiculo_modelo}
                  onChange={(e) => handleInputChange("vehiculo_modelo", e.target.value)}
                  placeholder="Xi166, ZS200, DHLM.20..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehiculo-serie">Serie</Label>
                <Input
                  id="vehiculo-serie"
                  value={formData.vehiculo_serie}
                  onChange={(e) => handleInputChange("vehiculo_serie", e.target.value)}
                  placeholder="123456"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Descripción del Trabajo */}
        <div className="space-y-2">
          <Label htmlFor="descripcion">Descripción del Trabajo *</Label>
          <Textarea
            id="descripcion"
            value={formData.descripcion}
            onChange={(e) => handleInputChange("descripcion", e.target.value)}
            placeholder="Describe el problema o trabajo a realizar..."
            rows={4}
          />
        </div>

        {/* Campos Opcionales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tecnico">Técnico Asignado</Label>
            <Input
              id="tecnico"
              value={formData.tecnico_asignado}
              onChange={(e) => handleInputChange("tecnico_asignado", e.target.value)}
              placeholder="Opcional"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tipo-trabajo">Tipo de Trabajo</Label>
            <Select value={formData.tipo_trabajo} onValueChange={(value) => handleInputChange("tipo_trabajo", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Opcional" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="reparacion">Reparación</SelectItem>
                <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                <SelectItem value="revision">Revisión</SelectItem>
                <SelectItem value="instalacion">Instalación</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="prioridad">Prioridad</Label>
            <Select value={formData.prioridad} onValueChange={(value) => handleInputChange("prioridad", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Opcional" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="baja">Baja</SelectItem>
                <SelectItem value="media">Media</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="urgente">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Fotos Adjuntas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Fotos Adjuntas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="file"
                id="fotos-input"
                multiple
                accept="image/*"
                onChange={handleSeleccionarFotos}
                className="hidden"
              />
              <Button type="button" variant="outline" onClick={() => document.getElementById("fotos-input")?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Añadir Fotos
              </Button>
              <span className="text-sm text-gray-500">
                {fotosAdjuntas.length} foto{fotosAdjuntas.length !== 1 ? "s" : ""} seleccionada
                {fotosAdjuntas.length !== 1 ? "s" : ""}
              </span>
            </div>

            {fotosAdjuntas.length === 0 ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No hay fotos seleccionadas</p>
                <p className="text-sm text-gray-500">Haz clic en "Añadir Fotos" para seleccionar imágenes</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {fotosAdjuntas.map((foto) => (
                  <div key={foto.id} className="relative border rounded-lg overflow-hidden">
                    <img src={foto.url || "/placeholder.svg"} alt={foto.nombre} className="w-full h-32 object-cover" />
                    <div className="p-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate">{foto.nombre}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEliminarFoto(foto.id)}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <Input
                        placeholder="Descripción opcional..."
                        value={foto.descripcion}
                        onChange={(e) => handleDescripcionFoto(foto.id, e.target.value)}
                        className="text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Botones */}
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={cargandoParte}>
            Cancelar
          </Button>
          <Button type="submit" disabled={cargandoParte}>
            {cargandoParte ? "Creando..." : "Crear Parte"}
          </Button>
        </div>
      </form>
    </div>
  )
}
